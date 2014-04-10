/////////////////////////////////////////////////////////////////////////////
// Explodr
// (c) Kyle Kamperschroer, 2014
/////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////
// Members
/////////////////////////////////////////////////////////////////////////////

// If we are debugging or not
var mDebug = true;

// The canvas element
var mCanvas = null;

// The context of the canvas
var mContext = null;

// The width of the total canvas
var mTotalWidth = 0;

// The height of the total canvas
var mTotalHeight = 0;

// The width of the game area
var mWidth = 0;

// The height of the game area
var mHeight = 0;

// The width of the upper area
var mUpperWidth = 0;

// The height of the upper area
var mUpperHeight = 0;

// The array of all our ball objects
var mBalls = [];

// The array of ball objects that are actioning
var mActioningBalls = [];

// The array of possible color palettes
var mPalettes = [];

// The color palette
var mPalette = null;

// The actual built ball radius
var mRadius = 0;

// The built min velocity
var mMinVelocity = 0;

// The built max velocity
var mMaxVelocity = 0;

// The built rate of expansion
var mRateOfExpansion = 0;

// The built rate of shrinkage
var mRateOfShrinkage = 0;

// The current level
var mLevel = 1;

// The audio handler
var mAudioHandler = null;


/////////////////////////////////////////////////////////////////////////////
// Functions
/////////////////////////////////////////////////////////////////////////////

// This function initializes all of our member variables
function Init(){
    // Get the canvas
    mCanvas = document.getElementById('game');

    // Get the width and height of the canvas (/2 for better performance)
    mTotalWidth = window.innerWidth;
    mTotalHeight = window.innerHeight;

    // Set the size of the canvas appropriately
    mCanvas.setAttribute('width', mTotalWidth);
    mCanvas.setAttribute('height', mTotalHeight);

    // The game is a square played in portrait mode, so make it the width
    mWidth = mTotalWidth;
    mHeight = mTotalWidth;

    // The upper area will be the same width, but it's height will be the
    // difference between the game area and total height
    mUpperWidth = mTotalWidth;
    mUpperHeight = mTotalHeight - mHeight;

    // Calculate the ball radius
    mRadius = BALL_RADIUS_PERCENTAGE * mWidth;

    // Get the context of the canvas
    mContext = mCanvas.getContext('2d');

    // Draw the line dividing the upper area from the game area
    mContext.beginPath();
    mContext.moveTo(0, mUpperHeight-1);
    mContext.lineTo(mUpperWidth, mUpperHeight-1);
    mContext.stroke();

    // Calculate the min and max velocities
    mMinVelocity = MIN_VELOCITY_PERCENTAGE * mWidth;
    mMaxVelocity = MAX_VELOCITY_PERCENTAGE * mWidth;

    // Calculate the rate of expansion and shrinkage
    mRateOfExpansion = RATE_OF_EXPANSION_PERCENTAGE * mRadius;
    mRateOfShrinkage = RATE_OF_SHRINKAGE_PERCENTAGE * mRadius;

    // Debug message
    if (mDebug){
        console.log("initialized members. Canvas = " + mCanvas +
                    " has width = " + mWidth + " and height = " + mHeight);
    }

    // Build the color palettes
    BuildPalettes();

    // Now build the balls for the first level
    BuildBalls(mLevel + BALLS_ADDED_TO_LEVEL);

    // Build the audio handler
    mAudioHandler = new AudioHandler();

    // Bind a mouse click event to the canvas
    mCanvas.addEventListener('click', function(event){
        RespondToClick(GetMousePosition(event));
    });

    // Setup animation frame stuff
    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = ( function() {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
                    window.setTimeout( callback, 1000 / 60 );
                };
        } )();
    }
}

// This function builds the color palettes variable
function BuildPalettes(){
    // These are all from the wonderful colour lovers website
    
    // Giant goldfishby manekineko
    // http://www.colourlovers.com/palette/92095/Giant_Goldfish
    mPalettes.push(
        [
            "#69D2E7",
            "#A7DBD8",
            "#E0E4CC",
            "#F38630",
            "#FA6900"
        ]);

    // Cheer up emo kid by electrikmonk
    // http://www.colourlovers.com/palette/1930/cheer_up_emo_kid
    mPalettes.push(
        [
            "#556270",
            "#4ECDC4",
            "#C7F464",
            "#FF6B6B",
            "#C44D58"
        ]);

    // Ocean Five by DESIGNJUNKEE
    // http://www.colourlovers.com/palette/1473/Ocean_Five
    mPalettes.push(
        [
            "#00A0B0",
            "#6A4A3C",
            "#CC333F",
            "#EB6841",
            "#EDC951"
        ]);

    // Gamebookers by plamenj
    // http://www.colourlovers.com/palette/148712/Gamebookers
    mPalettes.push(
        [
            "#FF9900",
            "#424242",
            "#E9E9E9",
            "#BCBCBC",
            "#3299BB"
        ]);

    // Finally, set the current palette to one of these
    mPalette = mPalettes[Math.floor(Math.random() * mPalettes.length)];
}

// The intent of this function is to build all of the balls 
function BuildBalls(numBalls){
    // Build each ball
    for (var i=0; i<numBalls; i++){
        mBalls.push(
            new Ball(
                Math.random() *
                    (mWidth - (mRadius * 2)) + mRadius, // x pos
                Math.random() *
                    (mHeight - (mRadius * 2)) + mRadius, // y pos
                GenerateVelocity(), // velocity x
                GenerateVelocity(), // velocity y
                mRadius, // radius
                Math.floor(Math.random() * mPalette.length), // color id
                mRateOfExpansion, // calculated rate of expansion
                mRateOfShrinkage
                )
            );
    }

    // Cool. Balls are built.
}

// This function will generate a random value between 5 and -5.
// The absolute value will always be greater than 1
function GenerateVelocity(){
    var x = 0;
    while(Math.abs(x) < mMinVelocity){
        x = (Math.random() * mMaxVelocity * 2) - mMaxVelocity;
    }
    return x;
}

// This function updates everything
function UpdateBalls(){
    // Loop through each ball
    for (var i=0; i<mBalls.length; i++){
        // Get the current ball
        var ball = mBalls[i];

        if (ball.isDead){
            // Yikes. Remove it from our array.
            mBalls.splice(i,1);
        }else if (ball.isExpanding){
            // Update the radius
            ball.radius += ball.rateOfExpansion;

            // Slow the rate of expansion by 10%
            ball.rateOfExpansion *= RATE_OF_DECELERATION;

            // Check if the rate of expansion is low enough to stop
            if (ball.rateOfExpansion < MIN_RATE_OF_EXPANSION){
                // Stop expanding
                ball.rateOfExpansion = 0;

                // Set the flag for isExpanded
                ball.isExpanding = false;
                ball.isExpanded = true;
            }

            // Bounce check to not overlap any area
            BounceCheck(ball);
        }else if (ball.isExpanded){
            // Check if it's time to die
            if (ball.framesTilDeath <= 0){
                ball.die();
            }else{
                // Subtract 1 from framesTilDeath
                ball.framesTilDeath--;
            }
        }else if (ball.isShrinking){
            // Update the radius
            ball.radius += ball.rateOfShrinkage;

            // Accelerate the rate of expansion by 10%
            ball.rateOfShrinkage *= RATE_OF_ACCELERATION;

            // Check if it's radius has dropped below zero
            if (ball.radius <= 0){
                // Wow, ball. RIP.
                ball.markAsDead();
            }
        }else{ // The ball is moving! Collision checks
            // Bounce check
            BounceCheck(ball);

            // Now check if this ball has hit any actionable ball
            if (HasBallHitActioningBall(ball)){
                ball.explode();
                mAudioHandler.pop();

                // Add this ball to our array of actioning balls
                mActioningBalls.push(ball);
            }else{
                // Update the position
                ball.x += ball.velocityX;
                ball.y += ball.velocityY;
            }
        }
    } // end for

    // Loop through our actioning balls, clearing any dead ones
    for (var i=0; i<mActioningBalls.length; i++){
        if (mActioningBalls[i].isDead){
            // Remove the dead ball!
            mActioningBalls.splice(i,1);
        }
    }
}

// This function checks if the ball needs to bounce of the wall
function BounceCheck(ball){
    // Check if the ball has hit an 'x' wall
    if (ball.x <= ball.radius){
        // Reverse the velocity (bounce)
        ball.velocityX = -ball.velocityX;

        // Set the x position
        ball.x = ball.radius;
    }else if (ball.x >= mWidth - ball.radius){
        // Reverse the x velocity (bounce)
        ball.velocityX = -ball.velocityX;

        // Set the x position
        ball.x = mWidth - ball.radius;
    }

    // Check if the ball has hit a 'y' wall
    if (ball.y <= ball.radius){
        // Reverse the y velocity (bounce)
        ball.velocityY = -ball.velocityY;

        // Set the y position
        ball.y = ball.radius;
    }else if (ball.y >= mHeight - ball.radius){
        // Reverse the y velocity (bounce)
        ball.velocityY = -ball.velocityY;

        // Set the x position
        ball.y = mHeight - ball.radius;
    }
}

// This function updates the score
function UpdateScoreboard(){
    // Count the number of balls that aren't actioning
    var count = 0;
    for (var i=0; i<mBalls.length; i++){
        var ball = mBalls[i];

        // Check if not actioning
        if (!ball.isActioning){
            count++;
        }
    }

    // TODO -- Paint it somewhere on the canvas
}

// This function does collision checking to see if the provided
// ball has colided with any other ball that is 'actioning'
function HasBallHitActioningBall(ball){
    // Iterate through
    for (var i=0; i<mActioningBalls.length; i++){
        // Get the other ball
        var otherBall = mActioningBalls[i];

        // Skip if it's dead
        if (otherBall.isDead){
            continue;
        }

        // Now see if it's collided
        var distX = ball.x - otherBall.x;
        var distY = ball.y - otherBall.y;
        var distance =
            Math.abs(
                Math.sqrt(
                    distX * distX + distY * distY
                )
            )

        // Check for collision
        if (distance <= (ball.radius + otherBall.radius)){
            return true;
        }
    }

    // Nothing! Return false
    return false;
}

// This function clears canvas
function ClearOld(){
    // Draw the white background to clear
    mContext.rect(0,mUpperHeight,mWidth,mHeight);
    mContext.fillStyle = BACKGROUND_COLOR;
    mContext.lineWidth = 1;
    mContext.fill();
}

// This function redraws everything
function Draw(){

    // Draw the balls
    DrawBalls();

    // TODO -- Draw the other important things
}

// This function draws all of the balls
function DrawBalls(){
    // Optimization -- Iterate through the palette and drawing
    // each color individually.

    for (var i=0; i<mPalette.length; i++){
        // Get the color
        var color = mPalette[i];

        // Begin a new path for this color
        mContext.beginPath();

        // Set the fill style to this color
        mContext.fillStyle = color;

        // Now iterate through the balls of this color
        for (var j=0; j<mBalls.length; j++){
            // Get the current ball
            var ball = mBalls[j];

            // Check if it's our color
            if (ball.color == i){
                // Draw it
                DrawBall(ball);
            }
        }

        // Fill it in
        mContext.fill();
    }

    /**
    // Draw each ball
    for (var i=0; i<mBalls.length; i++){
        // Get the current ball
        var ball = mBalls[i];

        // Draw it
        DrawBall(ball);
    };
    **/
}

// This function draws an individual ball
function DrawBall(ball){
    var r = ball.radius - 1.0;
    // Check if it's small enough to return
    if (r < 0.0){
        return;
    }

    // Move the pen
    mContext.moveTo(ball.x, ball.y + mUpperHeight);
    
    // We have to draw
    mContext.arc(ball.x,
                 ball.y + mUpperHeight, // Limit to the game area,
                 r,
                 0,
                 2 * Math.PI,
                 false);
}

// This function is called once to start the game
function Run(){
    // Request an animation frame
    requestAnimationFrame(Run);

    // Update the balls
    UpdateBalls();

    // Update the scoreboard
//    UpdateScoreboard();

    // Draw the scene
    if (mBalls.length > 0){
        ClearOld();
        Draw();
    }
};

// This function will get the click position
function GetMousePosition(event){
    var rect = mCanvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// This function responds to a click from the user
function RespondToClick(mousePos){
    // Only draw if it's in the right area
    if (mousePos.y > mUpperHeight){
        // Build a new ball to explode at this location
        var explodingBall =
            new Ball(
                mousePos.x, // x pos
                mousePos.y - mUpperHeight, // y pos
                0, // x vel (not moving)
                0, // y vel (not moving)
                mRadius,
                Math.floor(Math.random() * mPalette.length), // color id
                mRateOfExpansion, // calculated rate of expansion
                mRateOfShrinkage // calculated rate of shrinkage
            );

        // Tell the ball to explode
        explodingBall.explode();
        mAudioHandler.pop();

        // Add this ball to our actioning balls array
        mActioningBalls.push(explodingBall);

        // Push it to our array of balls
        mBalls.push(explodingBall);
    }else{
        // TODO -- Ok, user didn't click in the game. Check if it was an item.

        // For now, add 10 balls
        BuildBalls(10);
    }
}

//// Execution Start ////n
window.onload = function(){
    // TODO -- Show loading spinner

    // Init members
    Init();

    // Start the game loop
    Run();
    
};

// FOR COCOONJS -- Add the window
mCanvas = document.createElement("canvas");
document.body.appendChild(mCanvas);

