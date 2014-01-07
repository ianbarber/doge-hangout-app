/** @license Copyright 2014 Google Inc. All rights reserved. */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var TIMEOUT = 5000;
var overlays = {};
var overlay_id = 0;
var doge;
var enabled = false; // Toggled on init.
var side = true;
var prefix = [
    "So", "Very", "Such", "Much"
];
var suffix = [
    "hangout", "video", "doge"
];

function suchRender(wat) {
    var canvas = document.createElement("canvas");
    canvas.height = 26;
    canvas.width = 20 * wat.length;
    var context = canvas.getContext("2d");
    context.font = "24px 'Comic Sans MS'";
    var metric = context.measureText(wat)
    canvas.width =  metric.width;
    context.fillStyle = veryColour();
    context.fillText(wat, 0, 20);

    var dataUrl = canvas.toDataURL();
    var resource = gapi.hangout.av.effects.createImageResource(
         dataUrl);
    var overlay = resource.createOverlay();
    var x = (Math.random() / 5) + 0.21; 
    x = side ? -x : x;
    var y = (Math.random() / 2) - 0.1; 
    y = Math.random() < 0.5 ? -y : y;
    side = !side;
    overlay.setPosition(x, y);
    overlay.setScale(0.22, gapi.hangout.av.effects.ScaleReference.WIDTH);
    overlay.setVisible(true);
    overlays[++overlay_id] = overlay;
    return overlay_id;
}

function muchFace() {
    var resource = gapi.hangout.av.effects.createImageResource(
            'https://diesel-talon-426.appspot.com/static/apps/doge.png');
    var overlay = resource.createFaceTrackingOverlay(
        {
            'trackingFeature':
                gapi.hangout.av.effects.FaceTrackingFeature.NOSE_ROOT,
             'scaleWithFace': true,
             'rotateWithFace': true,
             'scale': 1.1,
             //'offset': {'x': 10, 'y': 0}//,
             'rotation': -0.2
    });
    overlay.setVisible(true);
    doge = overlay;
}

function muchPhrase() {
    if(!enabled) {
        return;
    }
    var phrase = Math.random() < 0.7 ?
        random(prefix) + " " + random(suffix) :
        "Wow";
    var id = suchRender(phrase);
    setTimeout(function(){ muchRemove(id); }, TIMEOUT * 4);
    setTimeout(muchPhrase, TIMEOUT);
}

function muchRemove(id) {
    if(overlays[id] != undefined) {
        overlays[id].dispose();
        delete overlays[id];
    }
}

function veryColour() {
    var colours = [
        "blue", "red", "yellow",
        "pink", "green", "orange"
    ];
    return random(colours);
}


function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function addParticipant(person) {
    var nameparts = person.displayName.split(" ");
    suffix = suffix.concat(nameparts);
}

function toggle() {
    var el = document.getElementById("enable");
    if (enabled) {
        enabled = false;
        el.value = "Doge";
        if(doge) {
            doge.setVisible(false);
            for(key in overlays) {
                muchRemove(key);
            }
        }
        
    } else {
        enabled = true;
        el.value = "No Doge";
        muchPhrase();
        if(doge) {
            doge.setVisible(true);
        } else {
            muchFace();
        }
    }
}

function init() {
    gapi.hangout.onApiReady.add(
        function(eventObj) {
            console.log("init");
            gapi.hangout.hideApp();
            // Add participants, and setup a callback.
            gapi.hangout.onParticipantsAdded.add(
                function(eventObj) { 
                    console.log(eventObj);
                    for(key in eventObj.addedParticipants) {
                        addParticipant(eventObj.addedParticipants[key].person);
                    }
                }
            );
            var people = gapi.hangout.getParticipants();
            for(key in people) {
                addParticipant(people[key].person);
            }
            toggle();
        }
    );
}
init();