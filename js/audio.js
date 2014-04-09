/////////////////////////////////////////////////////////////////////////////
// AudioHandler class (uses howler.min.js)
/////////////////////////////////////////////////////////////////////////////

// The intent of this class is to handle any audio the game needs to play.

// Constructor
function AudioHandler(){
    // The audio sounds
    var sounds = [];

    // Push each one
    sounds.push(new Howl({urls: ["audio/pop1.mp3"]}));
    sounds.push(new Howl({urls: ["audio/pop2.mp3"]}));
    sounds.push(new Howl({urls: ["audio/pop3.mp3"]}));
    sounds.push(new Howl({urls: ["audio/pop4.mp3"]}));

    // This function plays a random sound
    this.pop = function(){
        sounds[Math.floor(Math.random() * sounds.length)].play();
    };

}
