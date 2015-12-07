// Meteor Shower by Roy Curtis
// Licensed under MIT, 2015

'use strict';

// ## Global references
 
var fastRandom = goo.MathUtils.fastRandom;

// ## Global state

var world   = null;
var master  = null;
var meteors = [];

var nextSpawn = 0;

// ## Utility methods

function spawnNewMeteor()
{
    var position = new goo.Vector3();
    var meteor   = goo.EntityUtils.clone(world, master,
    {
        shareMeshData  : true,
        shareMaterials : true,
        shareUniforms  : true,
        shareTextures  : true
    });
    
    // X range from -1.5 to 8
    position.x  = (fastRandom() * 9.5) - 1.5;
    // Y range from 2.5 to 4
    position.y  = (fastRandom() * 1.5) + 2.5;
    // Z can either be behind planet or in front of
    var zChance = fastRandom() * 90;
    
    if      (zChance < 30)
        position.z = -1;
    else if (zChance < 60)
        position.z = 0.25;
    else
        position.z = 4;
    
    meteor.setTranslation(position);
    
    var scaleMag = (fastRandom() * 0.5) + 0.5;
    meteor.setScale( new goo.Vector3(scaleMag, scaleMag, 0) );
    
    var motionMag = (fastRandom() * 0.1) + 0.1;
    meteor.motion = new goo.Vector3(-motionMag, -motionMag, 0);
    
    meteor.addToWorld();
    meteors.push(meteor);
}

// ### Goo methods

var setup = function (args, ctx)
{
    world = ctx.world;
    
    // Hold reference to master meteor
    master = args.entity;
    master.removeFromWorld();
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
    
    if (meteors.length < 6 && nextSpawn < 0)
    {
        spawnNewMeteor();
        // Next spawn range from 20 to 40 ticks
        nextSpawn = (fastRandom() * 20) + 20
    }
    
    meteors = meteors.filter(function(meteor)
    {
        meteor.addTranslation(meteor.motion);
        
        var pos = meteor.getTranslation();
        if (pos.x < -7 || pos.y < -4)
        {
            meteor.removeFromWorld();
            return false;
        }
        
        return true;
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