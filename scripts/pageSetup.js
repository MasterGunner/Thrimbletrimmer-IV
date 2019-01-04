// var input = {
//     id: '2549',
//     start: 10,
//     end: 591.926213,
//     title: 'Desert Bus Clip',
//     description: 'A clip from Desert Bus.',
//     source: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
// }

var player = null;
setupPlayer(input.source, input.start, input.end);
document.getElementById("VideoTitle").value = input.title;
document.getElementById("VideoDescription").value = input.description;

function setupPlayer(source, startTrim, endTrim) {
    //Make poster of DB logo in correct aspect ratio, to control initial size of fluid container.
    var options = {
        sources: [{ src: source }],
        //fluid:true,
        controls:true,
        autoplay:false,
        width:1280,
        height:420,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        inactivityTimeout: 0,
        controlBar: {
            fullscreenToggle: false,
            volumePanel: {
                inline: false
            }
        }
    };
    player = videojs('my-player', options, function onPlayerReady() {
        videojs.log('Your player is ready!');

        // In this context, `this` is the player that was created by Video.js.
        this.on('ready', function() {
            //this.play();
        });

        this.tech({ IWillNotUseThisInPlugins: true }).hls.playlists.on('loadedmetadata', function() {
            // setTimeout(function() { player.play(); }, 1000);
            player.hasStarted(true); //So it displays all the controls.
        });

        // How about an event listener?
        this.on('ended', function() {
            videojs.log('Awww...over so soon?!');
        });
    });
    var hlsQS = player.hlsQualitySelector();
    var trimmingControls = player.trimmingControls({ startTrim:startTrim, endTrim:endTrim });
}

thrimbletrimmerSubmit = function() {
    document.getElementById('SubmitButton').disabled = true;
    if(player.trimmingControls().options.startTrim >= player.trimmingControls().options.endTrim) {
        alert("End Time must be greater than Start Time");
        document.getElementById('SubmitButton').disabled = false;
    } else {
        var discontinuities = mapDiscontinuities();
        var wubData = {
            id:input.id,
            start:getRealTimeForPlayerTime(discontinuities, player.trimmingControls().options.startTrim),
            end:getRealTimeForPlayerTime(discontinuities, player.trimmingControls().options.endTrim),
            title:document.getElementById("VideoTitle").value,
            description:document.getElementById("VideoDescription").value
        };
        alert(JSON.stringify(wubData));
        console.log(wubData);
        //var posting = $.post('/setVideo', wubData);
        // var posting = $.get('https://wubloader.codegunner.com/cut/seabats/source.ts?start='+wubData.start.replace('Z','')+'&end='+wubData.end.replace('Z',''));
        // posting.done(function(data) {
        //     alert('Successfully submitted video.\r\n' + data);
        //     //window.close();
        // });
        // posting.fail(function(data) {
        //     alert('Failed to submit video.\r\n' + data.status+' - '+data.responseText);
        //     console.log(wubData);
        //     document.getElementById('SubmitButton').disabled = false;
        // });
        //$('#outputFile').attr({target: '_blank', href: 'https://wubloader.codegunner.com/cut/seabats/source.ts?start='+wubData.start.replace('Z','')+'&end='+wubData.end.replace('Z','') });
        
        //document.getElementById('outputFile').src = 'https://wubloader.codegunner.com/cut/seabats/source.ts?start='+wubData.start.replace('Z','')+'&end='+wubData.end.replace('Z','');

        var targetURL = document.getElementById("WubloaderLocation").value + 
            "/cut/" + document.getElementById("StreamName").value + 
            "/source.ts?start=" + wubData.start.replace('Z','') + 
            "&end=" + wubData.end.replace('Z','') + 
            "&allow_holes=" + String(document.getElementById('AllowHoles').checked) +
            "&experimental=" + String(document.getElementById('IsExperimental').checked);
        console.log(targetURL);
        var cutStartTime = new Date();
        var cutting = $.get(targetURL);
        cutting.done(function(data) {
            var cutEndTime = new Date();
            alert("Successfully Cut Video.\r\n" + targetURL + "\r\nCutting Time: " + (cutEndTime-cutStartTime)/1000 + " seconds");
        });
    }
};

mapDiscontinuities = function() {
    var playlist = player.vhs.playlists.master.playlists[0];
    var discontinuities = playlist.discontinuityStarts.map(segmentIndex => { return {segmentIndex:segmentIndex, segmentTimestamp:playlist.segments[segmentIndex].dateTimeObject, playbackIndex:null}; });
    //var lastDiscontinuity = Math.max(...playlist.discontinuityStarts);
    var lastDiscontinuity = playlist.discontinuityStarts.slice(-1).pop(); //Assumes discontinuities are sorted in ascending order.

    var durationMarker = 0;
    for (var index = 0; index <= lastDiscontinuity; index++) { 
        let segment = playlist.segments[index];
        if(segment.discontinuity) {
            discontinuities.find(discontinuity => discontinuity.segmentIndex == index).playbackIndex = durationMarker;
        }
        durationMarker += segment.duration;
    }

    return discontinuities;
};

getRealTimeForPlayerTime = function(discontinuities, playbackIndex) {
    var streamStart = player.vhs.playlists.master.playlists[0].dateTimeObject;
    
    //Find last discontinuity before playbackIndex
    var lastDiscontinuity = discontinuities.filter(discontinuity => discontinuity.playbackIndex < playbackIndex).slice(-1).pop();
    if(lastDiscontinuity) {
        streamStart = lastDiscontinuity.segmentTimestamp;
        playbackIndex -= lastDiscontinuity.playbackIndex;
    }
    
    return new Date(streamStart.getTime()+playbackIndex*1000).toISOString();
};