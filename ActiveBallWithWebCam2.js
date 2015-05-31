var AEROTWIST = {};
AEROTWIST.ReactiveBall = (function() {

    var container,  controls, stats;
    var scene = null, camera = null, renderer = null;
    var sphereGeometry = null, sphereMatterial = null, sphere=null;
    var planeGeometry = null, planeMatterial = null, plane = null;    
    var lightFront = null, lightBottom = null;
    
    var callback = null, mousePressed = false;
    var cameraOrbit = 0, autoDistortTimer = null;
    
    var CAMERA_ORBIT      = 0.0025;
    var DISPLACEMENT      = 0.15;createObjects()
    var  SPRING_STRENGTH   = 0.0005;
    var  DAMPEN            = 0.998;
    var  ORIGIN            = new THREE.Vector3();
    var DEPTH             = 600;
    
    var keyboard = new THREEx.KeyboardState();
    
    
    var video, videoImage, videoImageContext, videoTexture;
    
    
    function init(){
	
	// SCENE
	scene = new THREE.Scene();
	
	//CAMERA
	var width = window.innerWidth, height = window.innerHeight, ratio = width/height;
	var angle = 45, aspect = ratio, near = 0.1, far = 20000;
	camera = new THREE.PerspectiveCamera( 
	    angle, 
	    aspect, 
	    near, 
	    far);
	scene.add(camera);
	camera.position.set(0,140,2000);
	camera.lookAt(scene.position);	
	
	// RENDERER
	if ( Detector.webgl ){
	    renderer = new THREE.WebGLRenderer( {
		antialias:true, 
		alpha: true} );
	}else{
	    renderer = new THREE.CanvasRenderer();
	} 
	renderer.setSize(width, height);
	
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	
	createObjects();
	createSprings();
	bindCallbacks();
	displaceRandomFace();
	requestAnimationFrame(animate);
    }
    
    
    function createObjects(){
	
	// SKYBOX/FOG
	//scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
	
	///////////
	// VIDEO //
	///////////
	if (scene==null)
	    init();

	video = document.getElementById( 'monitor' );
	
	videoImage = document.getElementById( 'videoImage' );
	videoImageContext = videoImage.getContext( '2d' );
	// background color if no video present
	videoImageContext.fillStyle = '#000000';
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
	
	videoTexture = new THREE.Texture( videoImage );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
	
	sphereMaterial = new THREE.MeshLambertMaterial({
	    color: 0xEEEEEE,
	    map: videoTexture, 
	    overdraw: true, 
	    //side:THREE.DoubleSide,
	    shininess: 200,
	    shading : THREE.SmoothShading} );
	
	sphereGeometry = new THREE.SphereGeometry( 
	    200, 
	    60, 
	    30 );
	
	sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	sphere.position.set(0,200,0);
	sphere.geometry.dynamic = true;
	sphere.scale.x = -1;
	
	scene.add(sphere);
	
	camera.position.set(0,150,1000);
	camera.lookAt(sphere.position);
	
	// FLOOR
	var planeTexture = new THREE.ImageUtils.loadTexture( 'images/image.jpg' );
	planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping; 
	planeTexture.repeat.set( 10, 10 );
	var planeMaterial = new THREE.MeshBasicMaterial( { 
	    map: planeTexture, 
	    side: THREE.DoubleSide } );
	var planeGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.position.y = -0.5;
	plane.rotation.x = Math.PI / 2;
	scene.add(plane);

	// LIGHT
	lightFlont = new THREE.PointLight(0xFFFFFFFF, 1.5);
	lightFlont.position.set(0,400,0);
	scene.add(lightFlont);

	lightBottom = new THREE.PointLight(0xFFFFFFFF, 1.3);
	lightBottom.position.set(0,-240,0);
	scene.add(lightBottom);

    }
    
    function createSprings(){
	if(sphere){
	    var sphereFaces = sphere.geometry.faces;
	    for(var f = 0; f < sphereFaces.length; f++) {
		var face = sphereFaces[f];
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
	}else{
	    createObjects()
	}
    }

    function createSpring(start, end) {
	var sphereVertices = sphere.geometry.vertices;
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
    
    function displaceVertex(vertex, magnitude) {
	var sphereVertices = sphere.geometry.vertices;
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
	if(sphere){
	    var sphereFaces     = sphere.geometry.faces;
            var randomFaceIndex = Math.floor(Math.random() * sphereFaces.length);
            var randomFace      = sphereFaces[randomFaceIndex];
	
	    displaceFace(randomFace, DISPLACEMENT);
	    
	    autoDistortTimer = setTimeout(displaceRandomFace, 100);
	}else{
	    createObjects();
	}
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
	var sphereVertices = sphere.geometry.vertices,
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
	var mouseX    = evt.offsetX || evt.clientX;
	var mouseY    = evt.offsetY || evt.clientY;
	var projector = new THREE.Projector();
	
	// set up a new vector in the correct
	// coordinates system for the screen
	var vector    = new THREE.Vector3(
	    (mouseX / window.innerWidth) * 2 - 1,
		-(mouseY / window.innerHeight) * 2 + 1,
	    0.5);
	
	// now "unproject" the point on the screen
	// back into the the scene itself. This gives
	// us a ray direction
	projector.unprojectVector(vector, camera);
	
	// create a ray from our current camera position
	// with that ray direction and see if it hits the sphere
	var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObject(sphere);

	// if the ray intersects with the
	// surface work out where and distort the face
	if(intersects.length) {
	    displaceFace(intersects[0].face, DISPLACEMENT);
	}
    } 
    /**
     * The main animation loop, the workhorse of
     * this little experiment of ours
     */
    function animate() {
	
	// update all the springs and vertex
	// positions
	updateVertexSprings();
	
	// move the camera around slightly
	// sin + cos = a circle
	cameraOrbit           += CAMERA_ORBIT;
	camera.position.x     = Math.sin(cameraOrbit) * DEPTH;
	camera.position.z     = Math.cos(cameraOrbit) * DEPTH;
	camera.lookAt(ORIGIN);
	
	// update the front light position to
	// match the camera's orientation
	//lightFront.position.x = Math.sin(cameraOrbit) * DEPTH;
	//lightFront.position.z = Math.cos(cameraOrbit) * DEPTH;
        	
	// flag that the sphere's geometry has
	// changed and recalculate the normals
	sphere.geometry.verticesNeedUpdate = true;
	sphere.geometry.normalsNeedUpdate = true;
	//sphere.geometry.computeFaceNormals();
	//sphere.geometry.computeVertexNormals();
	
	// render
	renderer.render(scene, camera);
	
	// schedule the next run
	requestAnimationFrame(animate);
    }
    
    // finally get everything under way
    init();
})();
    
 
