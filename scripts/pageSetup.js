var input = {
    id: '2549',
    start: 10,
    end: 591.926213,
    title: 'Desert Bus Clip',
    description: 'A clip from Desert Bus.',
    source: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
}

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
        autoplay:true,
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
        var wubData = {
            id:input.id,
            start:player.trimmingControls().options.startTrim,
            end:player.trimmingControls().options.endTrim,
            title:document.getElementById("VideoTitle").value,
            description:document.getElementById("VideoDescription").value
        };
        console.log(wubData);
        // var posting = $.post('/setVideo', wubData);
        // posting.done(function(data) {
        //     alert('Successfully submitted video.\r\n' + data);
        //     //window.close();
        // });
        // posting.fail(function(data) {
        //     alert('Failed to submit video.\r\n' + data.status+' - '+data.responseText);
        //     console.log(wubData);
        //     document.getElementById('SubmitButton').disabled = false;
        // });
    }
}