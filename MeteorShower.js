// Meteor Shower by Roy Curtis
// Licensed under MIT, 2015

'use strict';

// ## Global references
 
var fastRandom = goo.MathUtils.fastRandom;

// ## Constants
 
var MAX_METEORS = 6;

// ## Global state

var world   = null;
var master  = null;
var meteors = [];

var nextSpawn = 0;

// ## Utility methods

function spawnNewMeteor()
{
    var meteor = goo.EntityUtils.clone(world, master,
    {
        shareMeshData  : true,
        shareMaterials : true,
        shareUniforms  : true,
        shareTextures  : true
    });
    
    meteor.setTranslation([10, 10, 10]);
    meteor.motion = new goo.Vector3();
    meteor.skip   = true;
    
    meteor.addToWorld();
    meteors.push(meteor);
}

function respawnMeteor(meteor)
{
    var position = meteor.getTranslation();
    var motion   = meteor.motion;
    
    // X range from -1.5 to 8
    position.x  = (fastRandom() * 9.5) - 1.5;
    // Y range from 2.5 to 4
    position.y  = (fastRandom() * 1.5) + 2.5;
    // Z can either be behind, on horizon or in front of planet
    var zChance = fastRandom() * 90;
    
    if      (zChance < 30) position.z = -1;
    else if (zChance < 60) position.z = 0.25;
    else                   position.z = 4;
        
    var scaleMag = (fastRandom() * 0.5) + 0.5;
    meteor.setScale( [scaleMag, scaleMag, 0] );
    
    var motionMag = (fastRandom() * 0.1) + 0.1;
    meteor.motion.x = -motionMag;
    meteor.motion.y = -motionMag;
    
    meteor.skip = false;
}

// ### Goo methods

var setup = function (args, ctx)
{
    world = ctx.world;
    
    // Hold reference to master meteor
    master = args.entity;
    master.removeFromWorld();
    
    // Pregenerate all meteors
    for (var i = 0; i < MAX_METEORS; i++)
        spawnNewMeteor();
};

var cleanup = function (args, ctx)
{
    // Destroy and dereference all meteors
    meteors = meteors.filter(function(meteor)
    {
        meteor.removeFromWorld();
        return false;
    });
};

var update = function (args, ctx)
{
    nextSpawn--;
    
    if (nextSpawn < 0)
    {
        for (var i = 0; i < MAX_METEORS; i++)
            if (meteors[i].skip)
            {
                respawnMeteor(meteors[i]);
                break;
            }
        
        // Next spawn range from 10 to 20 ticks
        nextSpawn = (fastRandom() * 10) + 10;
    }
    
    meteors.forEach(function(meteor)
    {
        if (meteor.skip) return;

        var pos = meteor
            .addTranslation(meteor.motion)
            .getTranslation();
        
        if (pos.x < -7 || pos.y < -4)
            meteor.skip = true;
    });
};

// ## Goo parameters

var parameters = [
    {
        name:        "Entity",
        key:         "entity",
        description: "Entity to spawn and shower",
        type:        "entity"
    }
];