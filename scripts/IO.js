var mode = 2; // 0 = Arbitrary HLS stream for testing. 1 = Querying the restreamer and experimental cutter directly. 2 = Thrimshim.

if (mode == 0) {
    var testInput = {
        id: '2549',
        start: 10,
        end: 20,
        title: 'Desert Bus Clip',
        description: 'A clip from Desert Bus.',
        source: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
    }

    pageSetup = function() {
        document.getElementById("VideoTitle").value = testInput.title;
        document.getElementById("VideoDescription").value = testInput.description;
        loadPlaylist();
    };

    loadPlaylist = function() {
        setupPlayer(testInput.source, testInput.start, testInput.end);
    };

    thrimbletrimmerSubmit = function() { console.log("Submission disabled in this mode."); }; //Do nothing.
} 
else if (mode == 1) {
    pageSetup = function() {
        document.getElementById("wubloaderInputTable").style.display = "";

        if(!!sessionStorage.length){
            document.getElementById("WubloaderLocation").value = sessionStorage.getItem('wubloaderURL');
            document.getElementById("StreamName").value = sessionStorage.getItem('streamName');
            document.getElementById("StreamStart").value = sessionStorage.getItem('streamStart');
            document.getElementById("StreamEnd").value = sessionStorage.getItem('streamEnd');
            document.getElementById('AllowHoles').checked = (sessionStorage.getItem('allowHoles') === "true");
            document.getElementById('IsExperimental').checked = (sessionStorage.getItem('isExperimental') === "true");

            loadPlaylist();
        } else {
            //Set playlist start/end times to the last full hour.
            var startOfHour = new Date(new Date().setMinutes(0,0,0));
            
            document.getElementById("StreamStart").value = new Date(startOfHour.getTime() - 1000*60*60).toISOString().substring(0,19);
            document.getElementById("StreamEnd").value = startOfHour.toISOString().substring(0,19);

            loadPlaylist();
        }
    };

    loadPlaylist = function() {
            var playlist = document.getElementById("WubloaderLocation").value + "/playlist/" + document.getElementById("StreamName").value + ".m3u8"

            //Toggle between using UTC time inputs and Bustime inputs
            if(document.getElementById("BusTimeToggleBus").checked) {
                //Fetch list of hours available for that stream, to get your "start" point.
                fetch(document.getElementById("WubloaderLocation").value + "/files/" + document.getElementById("StreamName").value + "/source")
                .then(data => data.json())
                .then(function (data) {
                    if (!data.length) {
                        alert("No video available for stream.");
                        return;
                    }
                    var streamStart = new Date(data.sort()[0] + ":00:00Z");
                    var busTimeStart = document.getElementById("BusTimeStart").value;
                    var busTimeEnd = document.getElementById("BusTimeEnd").value;
                    
                    //Convert BusTime to milliseconds from start of stream
                    busTimeStart = (parseInt(busTimeStart.split(':')[0]) + busTimeStart.split(':')[1]/60)  * 1000 * 60 * 60;
                    busTimeEnd = (parseInt(busTimeEnd.split(':')[0]) + busTimeEnd.split(':')[1]/60)  * 1000 * 60 * 60;
                    
                    document.getElementById("StreamStart").value = new Date(streamStart.getTime() + busTimeStart).toISOString().substring(0,19);
                    document.getElementById("StreamEnd").value = new Date(streamStart.getTime() + busTimeEnd).toISOString().substring(0,19);
                    
                    var streamStart = document.getElementById("StreamStart").value ? "start="+document.getElementById("StreamStart").value:null;
                    var streamEnd = document.getElementById("StreamEnd").value ? "end="+document.getElementById("StreamEnd").value:null;
                    var queryString = (streamStart || streamEnd) ? "?" + [streamStart, streamEnd].filter((a) => !!a).join("&"):"";

                    setupPlayer(playlist + queryString);
                });
            } else {
                var streamStart = document.getElementById("StreamStart").value ? "start="+document.getElementById("StreamStart").value:null;
                var streamEnd = document.getElementById("StreamEnd").value ? "end="+document.getElementById("StreamEnd").value:null;
                var queryString = (streamStart || streamEnd) ? "?" + [streamStart, streamEnd].filter((a) => !!a).join("&"):"";

                setupPlayer(playlist + queryString);
            }

            document.getElementById('qualityLevel').innerHTML = "";
            fetch(document.getElementById('WubloaderLocation').value + '/files/' + document.getElementById('StreamName').value).then(data => data.json()).then(function (data) {
                if (!data.length) {
                    console.log("Could not retrieve quality levels");
                    return;
                }
                var qualityLevels = data.sort().reverse();
                qualityLevels.forEach(function(level, index) {
                    document.getElementById('qualityLevel').innerHTML += '<option value="'+level+'" '+(index==0 ? 'selected':'')+'>'+level+'</option>';
                })
            });
    };

    thrimbletrimmerSubmit = function() {
        document.getElementById('SubmitButton').disabled = true;
        if(player.trimmingControls().options.startTrim >= player.trimmingControls().options.endTrim) {
            alert("End Time must be greater than Start Time");
            document.getElementById('SubmitButton').disabled = false;
        } else {
            var discontinuities = mapDiscontinuities();

            var wubData = {
                id:0,
                start:getRealTimeForPlayerTime(discontinuities, player.trimmingControls().options.startTrim),
                end:getRealTimeForPlayerTime(discontinuities, player.trimmingControls().options.endTrim),
                title:document.getElementById("VideoTitle").value,
                description:document.getElementById("VideoDescription").value,
                submittedTimestamp:(new Date()).toISOString()
            };
            console.log(wubData);

            var targetURL = document.getElementById("WubloaderLocation").value + 
                "/cut/" + document.getElementById("StreamName").value + 
                "/"+document.getElementById('qualityLevel').options[document.getElementById('qualityLevel').options.selectedIndex].value+".ts" +
                "?start=" + wubData.start.replace('Z','') + 
                "&end=" + wubData.end.replace('Z','') + 
                "&allow_holes=" + String(document.getElementById('AllowHoles').checked) +
                "&experimental=" + String(document.getElementById('IsExperimental').checked);
            console.log(targetURL);
            document.getElementById('outputFile').src = targetURL;
        }
    };

} 
else if (mode == 2) {
    var thrimshimLocation = document.getElementById("WubloaderLocation").value + "/thrimshim/";
    var desertBusStart = new Date("2019-06-21T16:30:00Z");
    var desertBusChannel = "gamesdonequick";
    document.getElementById("StreamName").value = desertBusChannel;

    pageSetup = function() {
        document.getElementById("wubloaderInputTable").style.display = "";

        //Get values from ThrimShim
        var rowId = /id=(.*)(?:&|$)/.exec(document.location.search)[1];
        fetch(thrimshimLocation+rowId).then(data => data.json()).then(function (data) {
            if (!data) {
                alert("No video available for stream.");
                return;
            }
            //data = testThrimShim;
            document.getElementById("hiddenSubmissionID").value = data.id;
            document.getElementById("StreamStart").value = data.event_start
            document.getElementById("BusTimeStart").value = (new Date(data.event_start+"Z") < desertBusStart ? "-":"") + videojs.formatTime(Math.abs((new Date(data.event_start+"Z") - desertBusStart)/1000), 600.01);
            document.getElementById("StreamEnd").value = data.event_end
            document.getElementById("BusTimeEnd").value = (new Date(data.event_end+"Z") < desertBusStart ? "-":"") + videojs.formatTime(Math.abs((new Date(data.event_end+"Z") - desertBusStart)/1000), 600.01);
            document.getElementById("VideoTitle").value = "";
            document.getElementById("VideoDescription").value = data.description;
            loadPlaylist();
        });
    };

    loadPlaylist = function() {
        var playlist = document.getElementById("WubloaderLocation").value + "/playlist/" + document.getElementById("StreamName").value + ".m3u8"

        if(document.getElementById("BusTimeToggleBus").checked) {
            var streamStart = desertBusStart
            var busTimeStart = document.getElementById("BusTimeStart").value;
            var busTimeEnd = document.getElementById("BusTimeEnd").value;
            
            //Convert BusTime to milliseconds from start of stream
            busTimeStart = (parseInt(busTimeStart.split(':')[0]) + busTimeStart.split(':')[1]/60)  * 1000 * 60 * 60;
            busTimeEnd = (parseInt(busTimeEnd.split(':')[0]) + busTimeEnd.split(':')[1]/60)  * 1000 * 60 * 60;
            
            document.getElementById("StreamStart").value = new Date(streamStart.getTime() + busTimeStart).toISOString().substring(0,19);
            document.getElementById("StreamEnd").value = new Date(streamStart.getTime() + busTimeEnd).toISOString().substring(0,19);
            
            var streamStart = document.getElementById("StreamStart").value ? "start="+document.getElementById("StreamStart").value:null;
            var streamEnd = document.getElementById("StreamEnd").value ? "end="+document.getElementById("StreamEnd").value:null;
            var queryString = (streamStart || streamEnd) ? "?" + [streamStart, streamEnd].filter((a) => !!a).join("&"):"";

            setupPlayer(playlist + queryString);
        } else {
            var streamStart = document.getElementById("StreamStart").value ? "start="+document.getElementById("StreamStart").value:null;
            var streamEnd = document.getElementById("StreamEnd").value ? "end="+document.getElementById("StreamEnd").value:null;
            var queryString = (streamStart || streamEnd) ? "?" + [streamStart, streamEnd].filter((a) => !!a).join("&"):"";
            setupPlayer(playlist + queryString);
        }

        document.getElementById('qualityLevel').innerHTML = "";
        fetch(document.getElementById('WubloaderLocation').value + '/files/' + document.getElementById('StreamName').value).then(data => data.json()).then(function (data) {
            if (!data.length) {
                console.log("Could not retrieve quality levels");
                return;
            }
            var qualityLevels = data.sort().reverse();
            qualityLevels.forEach(function(level, index) {
                document.getElementById('qualityLevel').innerHTML += '<option value="'+level+'" '+(index==0 ? 'selected':'')+'>'+level+'</option>';
            })
        });
    };

    thrimbletrimmerSubmit = function() {
        document.getElementById('SubmitButton').disabled = true;
        if(player.trimmingControls().options.startTrim >= player.trimmingControls().options.endTrim) {
            alert("End Time must be greater than Start Time");
            document.getElementById('SubmitButton').disabled = false;
        } else {
            var discontinuities = mapDiscontinuities();

            var wubData = {
                video_start:getRealTimeForPlayerTime(discontinuities, player.trimmingControls().options.startTrim).replace('Z',''),
                video_end:getRealTimeForPlayerTime(discontinuities, player.trimmingControls().options.endTrim).replace('Z',''),
                video_title:document.getElementById("VideoTitle").value,
                video_description:document.getElementById("VideoDescription").value,
                allow_holes:String(document.getElementById('AllowHoles').checked),
                experimental:String(document.getElementById('IsExperimental').checked),
                upload_location:document.getElementById('uploadLocation').value,
                video_channel:document.getElementById("StreamName").value,
                video_quality:document.getElementById('qualityLevel').options[document.getElementById('qualityLevel').options.selectedIndex].value,
                uploader_whitelist:(document.getElementById('uploaderWhitelist').value ? document.getElementById('uploaderWhitelist').value.split(','):null),
                state:"EDITED",
                Auth_Token: "testToken"
            };
            // state_columns = ['state', 'uploader', 'error', 'video_link'] 
            console.log(wubData);

            //Submit to thrimshim
            var rowId = /id=(.*)(?:&|$)/.exec(document.location.search)[1];
            fetch(thrimshimLocation+rowId, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wubData)
            }).then(data => console.log(data));
        }
    };
}