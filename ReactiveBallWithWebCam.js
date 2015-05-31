/*
	Three.js "tutorials by example"
	Author: Lee Stemkoski
	Date: July 2013 (three.js v59dev)
*/
	
// MAIN

// standard global variables
var container, scene, camera, lightFront, lignhtBottom, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var cameraOrbit       = 0;
// custom global variables
var video, videoImage, videoImageContext, videoTexture;
var movieScreen;

var mousePressed = false;
var CAMERA_ORBIT = 0.0025;
var DISPLACEMENT = 0.15;
var SPRING_STRENGTH = 0.0005;
var DAMPEN            = 0.998;
var ORIGIN            = new THREE.Vector3();
var DEPTH = 600;

init();
//animate();

// FUNCTIONS 		
function init() 
{
    // SCENE
    scene = new THREE.Scene();
    // CAMERA
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0,150,400);
    camera.lookAt(scene.position);	
    // RENDERER
    if ( Detector.webgl )
	renderer = new THREE.WebGLRenderer( {antialias:true, alpha: true} );
    else
	renderer = new THREE.CanvasRenderer(); 
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container = document.getElementById( 'ThreeJS' );
    container.appendChild( renderer.domElement );
    // CONTROLS
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    // EVENTS
    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

/*
    // STATS
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );
*/

    // create a light which
    // we can position to the front
    lightFront = new THREE.PointLight(0xFFFFFF, 3);
    lightFront.position.y = 400;
    scene.add(lightFront);

    // and another from the bottom
    lightBottom = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    lightBottom.position.y = -240;
    scene.add(lightBottom);

/*
    // FLOOR
    var floorTexture = new THREE.ImageUtils.loadTexture( 'images/floor.jpg' );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
    floorTexture.repeat.set( 1, 1 );
    var floorMaterial = new THREE.MeshBasicMaterial( { 
	map: floorTexture, 
	transparent: true,
	side: THREE.DoubleSide 
    });

    var floorGeometry = new THREE.PlaneBufferGeometry(400, 400, 1, 1);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -20;
    floor.rotation.x = Math.PI / 2;
    //scene.add(floor);
    // SKYBOX/FOG
    scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
*/
    ///////////
    // VIDEO //
    ///////////
    
    video = document.getElementById( 'monitor' );
    
    videoImage = document.getElementById( 'videoImage' );
    videoImageContext = videoImage.getContext( '2d' );
    // background color if no video present
    videoImageContext.fillStyle = '#000000';
    videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
    
    videoTexture = new THREE.Texture( videoImage );
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    var movieMaterial = new THREE.MeshLambertMaterial( { 
	color     : 0xEEEEEE,
	map: videoTexture, 
	overdraw: true,
	shininess: 200,
	shading   : THREE.SmoothShading,
	side:THREE.DoubleSide } );
    // the geometry on which the movie will be displayed;
    // 		movie image will be scaled to fit these dimensions.
    var movieGeometry = new THREE.SphereGeometry( 150, 60, 30 );
    movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
    movieScreen.position.set(0,0,0);
    movieScreen.geometry.dynamic = true;
    scene.add(movieScreen);
    
    camera.position.set(600,0,0);
    camera.lookAt(movieScreen.position);
   
    createSprings();
    bindCallbacks();
    displaceRandomFace();
    requestAnimationFrame(animate);
}

/**
 * Creates a virtual spring between adjacent vertices in a
 * face. Since vertices are shared between faces
 * in the geometry, the faces are inherently connected to
 * each other
 */
function createSprings() {
    var sphereFaces = movieScreen.geometry.faces;
    for(var f = 0; f < sphereFaces.length; f++) {
	var face = sphereFaces[f];
	// these may be Face3s, i.e. composed of
	// three vertices, or Face4s, so we need
	// to double check and not use face.d if
	// it doesn't exist.
	if(face instanceof THREE.Face3) {
            createSpring(face.a, face.b);
            createSpring(face.b, face.c);
            createSpring(face.c, face.a);
	} else {
            createSpring(face.a, face.b);
            createSpring(face.b, face.c);
            createSpring(face.c, face.d);
            createSpring(face.d, face.a);	    
	}
    }
  }

  /**
   * Creates an individual spring
   *
   * @param {Number} start The index of the vertex for the spring's start
   * @param {Number} end The index of the vertex for the spring's start
   */
function createSpring(start, end) {
    var sphereVertices = movieScreen.geometry.vertices;
    var startVertex    = sphereVertices[start];
    var endVertex      = sphereVertices[end];
    
    // if the springs array does not
    // exist for a particular vertex
    // create it
    if(!startVertex.springs) {
	startVertex.springs = [];
	
	// take advantage of the one-time init
	// and create some other useful vars
	startVertex.normal = startVertex.clone().normalize();
	startVertex.originalPosition = startVertex.clone();
    }
    
    // repeat the above for the end vertex
    if(!endVertex.springs) {
	endVertex.springs = [];
	endVertex.normal = startVertex.clone().normalize();
	endVertex.originalPosition = endVertex.clone();
    }
    
    if(!startVertex.velocity) {
	startVertex.velocity = new THREE.Vector3();
    }
    // finally create a spring
    startVertex.springs.push({
	start   : startVertex,
	end     : endVertex,
	length  : startVertex.length(
            endVertex
	)	
    });
}

/**
 * Displaces the vertices of a face
 *
 * @param {THREE.Face3|4} face The face to be displaced
 * @param {Number} magnitude By how much the face should be displaced
 */
function displaceFace(face, magnitude) {
    // displace the first three vertices
    displaceVertex(face.a, magnitude);
    displaceVertex(face.b, magnitude);
    displaceVertex(face.c, magnitude);
    
    // if this is a face4 do the final one
    if(face instanceof THREE.Face4) {
	displaceVertex(face.d, magnitude);
    }   
}
  /**
   * Displaces an individual vertex
   *
   * @param {Number} vertex The index of the vertex in the geometry
   * @param {Number} magnitude The degree of displacement
   */
function displaceVertex(vertex, magnitude) {
    var sphereVertices = movieScreen.geometry.vertices;   
    // add to the velocity of the vertex in question
    // but make sure we're doing so along the normal
    // of the vertex, i.e. along the line from the
    // sphere centre to the vertex
    sphereVertices[vertex].velocity.add(
      sphereVertices[vertex].normal.
	    clone().
	    multiplyScalar(magnitude)	
    );
}

/**
   * Binds on the callbacks for the mouse
   * clicks and drags as well as the browser
   * resizing events
   */
function bindCallbacks() {
    // create our callbacks object
    callbacks = {
      /**
       * Called when the browser resizes
       */
	onResize: function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );
	},
	
	/**
	 * Called when the user clicks
	 *
	 * @param {Event} evt The mouse event
	 */
	onMouseDown: function(evt) {
            mousePressed = true;
            checkIntersection(evt);
            // clear the timer for the automatic wibble
            clearTimeout(autoDistortTimer);
	},
	/**
	 * Called when the user moves the mouse
	 *
	 * @param {Event} evt The mouse event
	 */
	onMouseMove: function(evt) {
            if(mousePressed) {
		checkIntersection(evt);
            }
	},
	
	/**
	 * Called when the user releases
	 *
	 * @param {Event} evt The mouse event
	 */
	onMouseUp: function() {
            mousePressed = false;
            // reset the timer for the automatic wibble
            autoDistortTimer = setTimeout(displaceRandomFace, 2000);
	},
	
	/**
	 * Prevent the user getting the text
	 * selection cursor
	 */
	onSelectStart: function() {
            return false;
	}
    };

    // now bind them on
    window.addEventListener('resize', callbacks.onResize, false);
    window.addEventListener('mousedown', callbacks.onMouseDown, false);
    window.addEventListener('mousemove', callbacks.onMouseMove, false);
    window.addEventListener('mouseup', callbacks.onMouseUp, false);
    
    renderer.domElement.addEventListener('selectstart', callbacks.onSelectStart, false);
}

/**
   * Chooses a face at random and displaces it
   * then sets the timeout for the next displacement
   */
function displaceRandomFace() {
    
    var sphereFaces     = movieScreen.geometry.faces,
    randomFaceIndex = Math.floor(Math.random() * sphereFaces.length),
    randomFace      = sphereFaces[randomFaceIndex];
    
    displaceFace(randomFace, DISPLACEMENT);
    
    autoDistortTimer = setTimeout(displaceRandomFace, 100);
}

 /**
  * Goes through each vertex's springs
  * and determines what forces are acting on the
  * spring's vertices. It then updates the vertices
  * and also dampens them back to their original
  * position.
  */
function updateVertexSprings() {
    
    // go through each spring and
    // work out what the extension is
    var sphereVertices = movieScreen.geometry.vertices,
    vertexCount    = sphereVertices.length,
    vertexSprings  = null,
    vertexSpring   = null,
    extension      = 0,
    length         = 0,
    force          = 0,
    vertex         = null,
    acceleration   = new THREE.Vector3(0, 0, 0);
    
    // go backwards, which should
    // be faster than a normal for-loop
    // although that's not always the case
    while(vertexCount--) {
	
	vertex = sphereVertices[vertexCount];
	vertexSprings = vertex.springs;
	
	// miss any verts with no springs
	if(!vertexSprings) {
            continue;
	}
	
	// now go through each individual spring
	for(var v = 0; v < vertexSprings.length; v++) {
            // calculate the spring length compared
            // to its base length
            vertexSpring = vertexSprings[v];
            length = vertexSpring.start.
		length(vertexSpring.end);
	    
            // now work out how far the spring has
            // extended and use this to create a
            // force which will pull on the vertex
            extension = vertexSpring.length - length;
	    
            // pull the start vertex
            acceleration.copy(vertexSpring.start.normal).multiplyScalar(extension * SPRING_STRENGTH);
            vertexSpring.start.velocity.add(acceleration);
	    
            // pull the end vertex
            acceleration.copy(vertexSpring.end.normal).multiplyScalar(extension * SPRING_STRENGTH);
            vertexSpring.end.velocity.add(acceleration);
	    
            // add the velocity to the position using
            // basic Euler integration
            vertexSpring.start.add(
		vertexSpring.start.velocity);
            vertexSpring.end.add(
		vertexSpring.end.velocity);
	    
            // dampen the spring's velocity so it doesn't
            // ping back and forth forever
            vertexSpring.start.velocity.multiplyScalar(DAMPEN);
            vertexSpring.end.velocity.multiplyScalar(DAMPEN);
	    
	}
	
	// attempt to dampen the vertex back
	// to its original position so it doesn't
	// get out of control
	vertex.add(
            vertex.originalPosition.clone().sub(
		vertex
            ).multiplyScalar(0.03)
	);
    }
}

  /**
   * Checks to see if the mouse click implies
   * a ray intersection with the sphere and, if
   * so, goes about displacing the face that it hit
   *
   * @param {Event} evt The mouse event
   */
function checkIntersection(evt) {
    
    // get the mouse position and create
    // a projector for the ray
    var mouseX    = evt.offsetX || evt.clientX,
    mouseY    = evt.offsetY || evt.clientY,
    projector = new THREE.Projector();
    
    // set up a new vector in the correct
    // coordinates system for the screen
    var vector    = new THREE.Vector3(
	(mouseX / window.innerWidth) * 2 - 1,
	    -(mouseY / window.innerHeight) * 2 + 1,
	0.5);
    
    // now "unproject" the point on the screen
    // back into the the scene itself. This gives
    // us a ray direction
    //projector.unprojectVector(vector, camera);
    vector.unproject(camera);

    // create a ray from our current camera position
    // with that ray direction and see if it hits the sphere
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize()),
    intersects = raycaster.intersectObject(movieScreen);
    
    // if the ray intersects with the
    // surface work out where and distort the face
    if(intersects.length) {
	displaceFace(intersects[0].face, DISPLACEMENT);
    }
}

function animate() {
    
    // update all the springs and vertex
    // positions
    updateVertexSprings();
    
    // move the camera around slightly
    // sin + cos = a circle
    cameraOrbit           += CAMERA_ORBIT;
    //camera.position.x     = Math.sin(cameraOrbit) * DEPTH;
    //camera.position.z     = Math.cos(cameraOrbit) * DEPTH;
    camera.lookAt(ORIGIN);

    // update the front light position to
    // match the camera's orientation
    lightFront.position.x = 600;//
    lightFront.position.z = -20;//Math.cos(cameraOrbit) * DEPTH;
    //lightFront.position.x = Math.sin(cameraOrbit) * DEPTH;
    //lightFront.position.z = Math.sin(cameraOrbit) * DEPTH;

    console.log('cx:'+ lightFront.position.x);
    console.log('cz:'+ lightFront.position.z);

    if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
    {
	videoImageContext.drawImage( 
	    video, 0, 0, videoImage.width, 
	    videoImage.height );
	if ( videoTexture ) 
	    videoTexture.needsUpdate = true;
    }

    // flag that the sphere's geometry has
    // changed and recalculate the normals
    movieScreen.geometry.verticesNeedUpdate = true;
    movieScreen.geometry.normalsNeedUpdate = true;
    movieScreen.geometry.computeFaceNormals();
    movieScreen.geometry.computeVertexNormals();

    // render
    renderer.render(scene, camera);

    // schedule the next run
    requestAnimationFrame(animate);
  }

