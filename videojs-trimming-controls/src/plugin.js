import videojs from 'video.js';
import {version as VERSION} from '../package.json';

const Plugin = videojs.getPlugin('plugin');

// Default options for the plugin.
const defaults = {
    startTrim:60,
    endTrim:120,
    limitPlayback:false
};

/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */
class TrimmingControls extends Plugin {
    /**
     * Create a TrimmingControls plugin instance.
     *
     * @param  {Player} player
     *         A Video.js Player instance.
     *
     * @param  {Object} [options]
     *         An optional options object.
     *
     *         While not a core part of the Video.js plugin architecture, a
     *         second argument of options is a convenient way to accept inputs
     *         from your plugin's caller.
     */
    constructor(player, options) {
        // the parent class will add player under this.player
        super(player);

        this.options = videojs.mergeOptions(defaults, options);

        this.createTrimmingControls();

        player.ready(() => {
            setTimeout(() => { this.updateTrimTimes(this.options.startTrim, this.options.endTrim);}, 100);
            

            player.on("timeupdate", () => {
                if(this.options.limitPlayback && this.player.currentTime() >= this.options.endTrim) {
                    this.player.currentTime(this.options.endTrim);
                    this.player.pause();
                }
            });

            player.on('playing', () => {
              videojs.log('playback began!');
              this.updateTrimTimes(this.options.startTrim, this.options.endTrim);
            });
        });
    }

    createTrimmingControls() {
        const player = this.player;

        const videoJsComponentClass = videojs.getComponent('Component');

        /**
         * Extend vjs button class for quality button.
         */
        class TrimControlBarClass extends videoJsComponentClass {
            /**
             * Component constructor.
             */
            constructor() {
                super(player, {title: player.localize('Trimming Controls')});
            }
            createEl() {
                return videojs.dom.createEl('div', {
                    // Prefixing classes of elements within a player with "vjs-" is a convention used in Video.js.
                    className: 'vjs-control-bar vjs-trimming-controls',
                    dir:'ltr'
                });
            }
        }

        const videoJSSpacerClass = videojs.getComponent('Spacer');

        const videoJSButtonClass = videojs.getComponent('Button');
        class GoToButtonClass extends videoJSButtonClass {
            constructor(_plugin, _targetPosition, _text) {
                super(player, {
                    // title: player.localize('Trim Button'), 
                    // label: "Trim Here"
                });
                this.trimmingControls = _plugin;
                this.targetPosition = _targetPosition;
                this.controlText(_text);
                this.el().getElementsByClassName('vjs-icon-placeholder')[0].classList += " material-icons";
            }
            handleClick() {
                if(this.targetPosition == 0) {
                    this.player().currentTime(this.trimmingControls.options.startTrim);
                } else if (this.targetPosition == 1) {
                    this.player().currentTime(this.trimmingControls.options.endTrim);
                }
            }
        }
        class TrimButtonClass extends videoJSButtonClass {
            constructor(_plugin, _targetPosition, _text) {
                super(player, {
                    // title: player.localize('Trim Button'), 
                    // label: "Trim Here"
                });
                this.trimmingControls = _plugin;
                this.targetPosition = _targetPosition;
                this.controlText(_text);
                this.el().getElementsByClassName('vjs-icon-placeholder')[0].classList += " material-icons";
            }
            handleClick() {
                if(this.targetPosition == 0) {
                    this.trimmingControls.updateTrimTimes(this.player().currentTime(), this.trimmingControls.options.endTrim);
                } else if (this.targetPosition == 1) {
                    this.trimmingControls.updateTrimTimes(this.trimmingControls.options.startTrim, this.player().currentTime());
                }
            }
        }

        class TrimTimeDisplayClass extends videoJsComponentClass {
            constructor(_defaultTime) {
                super(player, {});
                this.updateTimeContent(_defaultTime);
            }

            createEl() {
                return videojs.dom.createEl('input', {
                    // Prefixing classes of elements within a player with "vjs-" is a convention used in Video.js.
                    className: 'vjs-time-display'
                });
            }

            updateTimeContent(timeInSeconds) {
                videojs.dom.emptyEl(this.el());
                //this.controlText(videojs.formatTime(timeInSeconds, 600))
                //videojs.dom.appendContent(this.el(), videojs.formatTime(timeInSeconds, 600));
                //videojs.dom.textContent(this.el(), videojs.formatTime(timeInSeconds, 600));
                this.el().value = videojs.formatTime(timeInSeconds, 600.01);
            }

            
        }

        class FrameButtonClass extends videoJSButtonClass {
            constructor(_plugin, _targetPosition, _text) {
                super(player, {
                    // title: player.localize('Trim Button'), 
                    // label: "Trim Here"
                });
                this.trimmingControls = _plugin;
                this.targetPosition = _targetPosition;
                this.controlText(_text);
                this.el().getElementsByClassName('vjs-icon-placeholder')[0].classList += " material-icons";
            }
            handleClick() {
                if(this.targetPosition == 0) {
                    this.player().currentTime(this.player().currentTime() - 0.1);
                } else if (this.targetPosition == 1) {
                    this.player().currentTime(this.player().currentTime() + 0.1);
                }
            }
        }

        const videoJSPlayToggleClass = videojs.getComponent('PlayToggle');

        class playbackEndToggleClass extends videoJSButtonClass {
            constructor(_plugin, _text) {
                super(player, {
                    // title: player.localize('Trim Button'), 
                    // label: "Trim Here"
                });
                this.trimmingControls = _plugin;
                this.controlText(_text);
                this.el().getElementsByClassName('vjs-icon-placeholder')[0].classList += " material-icons";
            }
            handleClick() {
                this.trimmingControls.options.limitPlayback = !this.trimmingControls.options.limitPlayback;
                this.toggleClass('playbackLimited');
            }
        }

        //Creating Trimming Seek Bar
        this._trimSeekControlBar = new TrimControlBarClass();
        const trimSeekControlBarInstance = player.addChild(this._trimSeekControlBar, {componentClass: 'trimControlBar'}, player.children().length);
        trimSeekControlBarInstance.addClass('vljs-trim-seek');
        trimSeekControlBarInstance.el().innerHTML = '<div id="trimBarPlaceholderContainer"><div id="trimBarPlaceholder"></div></div>';

        // //Spacer
        // this._spacer1 = new videoJSSpacerClass();
        // const spacer1Instance = this._trimSeekControlBar.addChild(this._spacer1, {componentClass: 'spacer'}, 0);
        // spacer1Instance.setAttribute("style", "flex: 0 0 158px");

        // //Spacer
        // this._spacer1 = new videoJSSpacerClass();
        // const spacer2Instance = this._trimSeekControlBar.addChild(this._spacer1, {componentClass: 'spacer'}, 2);
        // spacer2Instance.setAttribute("style", "flex: 0 0 178px");

        //Creating Trimming Controls Bar
        this._trimControlBar = new TrimControlBarClass();
        const trimControlBarInstance = player.addChild(this._trimControlBar, {componentClass: 'trimControlBar'}, player.children().length);
        trimControlBarInstance.addClass('vljs-trim-buttons');

        //Trim Bar Controls order: spacer,GoTo,Time,SetPlayhead,frameadjust,playpause,frameAdjust,setPlayhead,time,GoTo, endplayback

        //Spacer for balance
        this._spacer = new videoJSSpacerClass();
        const spacerInstance = this._trimControlBar.addChild(this._spacer, {componentClass: 'spacer'}, 0);
        

        //Go To start of Trim
        this._startGoToButton = new GoToButtonClass(this, 0, "Go to start of trim segment");
        const startGoToButtonInstance = this._trimControlBar.addChild(this._startGoToButton, {componentClass: 'goToButton'}, 5);
        startGoToButtonInstance.addClass('vljs-trimming-button');
        startGoToButtonInstance.el().getElementsByClassName('vjs-icon-placeholder')[0].innerText = "skip_previous";

        //Create trim start time display
        this._startTrimTimeDisplay = new TrimTimeDisplayClass(this.options.startTrim);
        const startTrimTimeDisplayInstance = this._trimControlBar.addChild(this._startTrimTimeDisplay, {componentClass: 'trimTimeDisplay'}, 10);
        startTrimTimeDisplayInstance.on("change", function() { this.player_.trimmingControls().setTimestamps(startTrimTimeDisplayInstance.el().value, 0); });

        //Create set start at playhead button
        this._startTrimButton = new TrimButtonClass(this, 0, "Set trim start at playhead");
        const startTrimButtonInstance = this._trimControlBar.addChild(this._startTrimButton, {componentClass: 'trimButton'}, 20);
        startTrimButtonInstance.addClass('vljs-trimming-button');
        startTrimButtonInstance.el().getElementsByClassName('vjs-icon-placeholder')[0].innerText = "edit";

        //Create Frame Back Button
        this._frameBackButton = new FrameButtonClass(this, 0, "Move back 1 frame");
        const frameBackButtonInstance = this._trimControlBar.addChild(this._frameBackButton, {componentClass: 'frameButton'}, 22);
        frameBackButtonInstance.addClass('vljs-trimming-button');
        frameBackButtonInstance.el().getElementsByClassName('vjs-icon-placeholder')[0].innerText = "fast_rewind";

        //Create Play/Pause Button
        this._playPauseButton = new videoJSPlayToggleClass(this.player);
        const playPauseButtonInstance = this._trimControlBar.addChild(this._playPauseButton, {componentClass: 'playPauseButton'}, 25);
        
        //Create Frame Forward Button
        this._frameForwardButton = new FrameButtonClass(this, 1, "Move forward 1 frame");
        const frameForwardButtonInstance = this._trimControlBar.addChild(this._frameForwardButton, {componentClass: 'frameButton'}, 27);
        frameForwardButtonInstance.addClass('vljs-trimming-button');
        frameForwardButtonInstance.el().getElementsByClassName('vjs-icon-placeholder')[0].innerText = "fast_forward";

        //Create set end at playhead button
        this._endTrimButton = new TrimButtonClass(this, 1, "Set trim end at playhead");
        const endTrimButtonInstance = this._trimControlBar.addChild(this._endTrimButton, {componentClass: 'trimButton'}, 30);
        endTrimButtonInstance.addClass('vljs-trimming-button');
        endTrimButtonInstance.el().getElementsByClassName('vjs-icon-placeholder')[0].innerText = "edit";

        //Create trim end time display
        this._endTrimTimeDisplay = new TrimTimeDisplayClass(this.options.endTrim);
        const endTrimTimeDisplayInstance = this._trimControlBar.addChild(this._endTrimTimeDisplay, {componentClass: 'trimTimeDisplay'}, 40);
        endTrimTimeDisplayInstance.on("change", function() { this.player_.trimmingControls().setTimestamps(endTrimTimeDisplayInstance.el().value, 1); });
        
        //Go To end of Trim
        this._endGoToButton = new GoToButtonClass(this, 1, "Go to end of trim segment");
        const endGoToButtonInstance = this._trimControlBar.addChild(this._endGoToButton, {componentClass: 'goToButton'}, 50);
        endGoToButtonInstance.addClass('vljs-trimming-button');
        endGoToButtonInstance.el().getElementsByClassName('vjs-icon-placeholder')[0].innerText = "skip_next";

        //End playback at trim endpoint
        this._playbackEndToggle = new playbackEndToggleClass(this, "End playback at trim endpoint");
        const playbackEndToggleInstance = this._trimControlBar.addChild(this._playbackEndToggle, {componentClass: 'playbackEndToggle'}, 60);
        playbackEndToggleInstance.addClass('vljs-trimming-button');
        playbackEndToggleInstance.el().getElementsByClassName('vjs-icon-placeholder')[0].innerText = "stop";

    }

    updateTrimTimes(startValue, endValue) {
        //Update stored values
        this.options.startTrim = startValue;
        this.options.endTrim = endValue;
        //Update timestamp displays
        this._startTrimTimeDisplay.updateTimeContent(startValue);
        this._endTrimTimeDisplay.updateTimeContent(endValue);
        //Update slider
        document.getElementById("trimBarPlaceholder").style["marginLeft"] = startValue/this.player.duration()*100 + "%";
        document.getElementById("trimBarPlaceholder").style["marginRight"] = 100 - (endValue/this.player.duration()*100) + "%";
    }

    setTimestamps(value, index) {
        if(/^\d*:?\d*:?\d*\.?\d*$/.test(value)) {
            if(index === 0) {
                this.updateTrimTimes(this.getSeconds(value), this.options.endTrim);
            } else if (index === 1) {
                this.updateTrimTimes(this.options.startTrim, this.getSeconds(value));
            }
        } else {
            this._startTrimTimeDisplay.updateTimeContent(startValue);
            this._endTrimTimeDisplay.updateTimeContent(endValue);
        }
    }

    getSeconds(time){
        var timeArr = time.split(':'), //Array of hours, minutes, and seconds.
            s = 0, //Seconds total
            m = 1; //Multiplier
        while (timeArr.length > 0) { //Iterate through time segments starting from the seconds,
            s += m * timeArr.pop(); //multiply as  appropriate, and add to seconds total,
            m *= 60;				//increase multiplier.
        }
        return s;
    }
}

// Define default values for the plugin's `state` object here.
TrimmingControls.defaultState = {};

// Include the version number.
TrimmingControls.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('trimmingControls', TrimmingControls);

export default TrimmingControls;
