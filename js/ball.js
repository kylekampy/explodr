/////////////////////////////////////////////////////////////////////////////
// Ball class
/////////////////////////////////////////////////////////////////////////////

// The intent of this object is to be a ball. It will bounce like a ball, and
// it will explode like a ball, like every other ball has done before it.

// A ball has a number of attributes:
// - Location x
// - Location y
// - Velocity x
// - Velocity y
// - Radius
// - Color
// - isExpanding
// - isShrinking
// - rateOfExpansion
// - isDead

// Ball class w/ constructor
function Ball(x, y, vX, vY,
              r, clr, expanding,
              shrinking, rateOfExpansion,
              dead
             ) {
    this.x = x;
    this.y = y;
    this.velocityX = vX;
    this.velocityY = vY;
    this.radius = r;
    this.color = clr;

    // Some default values we need
    this.isActioning = false;
    this.isExpanding = false;
    this.isExpanded = false;
    this.framesTilDeath = BALL_LIFESPAN;
    this.isShrinking = false;
    this.rateOfExpansion = 0;
    this.isDead = false;

    /////////////////////////////////////////////////////////////////////////////
    // Functions
    /////////////////////////////////////////////////////////////////////////////

    // A function to explode this ball
    this.explode = function(){
        // Stop it from moving
        this.velocityX = 0;
        this.velocityY = 0;

        // Set isExpanding to true
        this.isActioning = true;
        this.isExpanding = true;

        // Set the rate of expansion to the default
        this.rateOfExpansion = RATE_OF_EXPANSION;
    };

    // A function to make this ball die
    this.die = function(){
        // Stop it from moving
        this.velocityX = 0;
        this.velocityY = 0;

        // Set is shrinking to true
        this.isActioning = true;
        this.isShrinking = true;

        // And we are no longer expanded
        this.isExpanded = false;

        // Set the rate of expansion to the default
        this.rateOfExpansion = RATE_OF_SHRINKAGE;
    };

    // A function to mark the ball as dead
    this.markAsDead = function(){
        this.isDead = true;
        this.isExpanding = false;
        this.isExpanded = false;
        this.isShrinking = false;
        this.isActioning = true; // leave as true since ball is not removed
        this.radius = 0;
    }

}

