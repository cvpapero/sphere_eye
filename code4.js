/*
	Three.js "tutorials by example"
	Author: Lee Stemkoski
	Date: July 2013 (three.js v59dev)
*/
	
// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();

// custom global variables
var video, videoImage, videoImageContext, videoTexture;

init();
animate();

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
	camera.position.set(0,140,2000);
	camera.lookAt(scene.position);	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
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
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
	// FLOOR
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
	// SKYBOX/FOG
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
	
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
	
	var movieMaterial = new THREE.MeshBasicMaterial({ 
	    map: videoTexture, 
	    overdraw: true, 
	    side:THREE.DoubleSide } );
	// the geometry on which the movie will be displayed;
	// 		movie image will be scaled to fit these dimensions.
    var movieGeometry = new THREE.SphereGeometry( 200, 60, 30 );
    var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
    movieScreen.position.set(0,200,0);
    movieScreen.scale.x = -1;
    scene.add(movieScreen);
	
	camera.position.set(0,150,1000);
	camera.lookAt(movieScreen.position);
				
	
}

function animate() 
{
    requestAnimationFrame( animate );
	render();		
	update();
}

function update()
{		
	if ( keyboard.pressed("p") ) // pause
		video.pause();
	if ( keyboard.pressed("r") ) // resume
		video.play();
	controls.update();
	stats.update();
}

function render() 
{	
	if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
	{
		videoImageContext.drawImage( video, 0, 0, videoImage.width, videoImage.height );
		if ( videoTexture ) 
			videoTexture.needsUpdate = true;
	}

	renderer.render( scene, camera );
}




/*

if ( ! Detector.webgl ) 
    Detector.addGetWebGLMessage();

var container;

var camera, scene, renderer;

      // the sphere
var sphereGeometry = null;
var sphereMaterial    = null;
var sphere            = null;

// the floor plane
var planeGeometry     = null;
var planeMaterial     = null;
var plane             = null;

// two lights
var lightFront        = null;
var lightBottom       = null;

var mesh, lightMesh, geometry;
//var spheres = [];

var directionalLight, pointLight;

var mouseX = 0;
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

document.addEventListener( 'mousemove', onDocumentMouseMove, false );

init();
animate();


function init(){
        
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    // カメラ作成
    camera = new THREE.PerspectiveCamera( 
	70,	
	window.innerWidth / window.innerHeight, 
	1, 
	10000 );

    camera.position.x = 6000;
    camera.position.x = -200;
    camera.position.z = 1000;

    cameraCube = new THREE.PerspectiveCamera( 
	75, 
	window.innerWidth / window.innerHeight, 
	1, 
	100000 );

    scene = new THREE.Scene();
    sceneCube = new THREE.Scene(); 

    var url = "jpg/image.jpeg";

    var urls = [
	"jpg/h3.jpg", "jpg/h5.jpg",
	"jpg/h1.jpg", "jpg/h6.jpg",
	"jpg/h2.jpg", "jpg/h4.jpg"
    ];

    sphereGeometry = new THREE.SphereGeometry( 
	200, 
	60, 
	30 );

    texture = THREE.ImageUtils.loadTexture( url );
   
    sphereMaterial = new THREE.MeshLambertMaterial({
	color     : 0xEEEEEE,
	map    : texture,
	shininess : 200,
	shading   : THREE.SmoothShading});

    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    //sphere.scale.x = -1;
    sphere.geometry.dynamic = true;
    sphere.position.y = 100;

    scene.add( sphere );
    //spheres.push( mesh );

    // create the floor
    planeGeometry = new THREE.PlaneGeometry( 400, 400, 1 );
    planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      map: THREE.ImageUtils.loadTexture("jpg/floor.jpg"),
      transparent: true
    });
    
    plane = new THREE.Mesh(planeGeometry, planeMaterial);

    // position the floor down a little
    // and rotate it to be perpendicular
    // to the centre of the sphere
    plane.rotation.x = Math.PI * -0.5;
    plane.position.y = -150;
    scene.add(plane);

    // create a light which
    // we can position to the front
    lightFront = new THREE.PointLight(0xFFFFFF, 1.5);
    lightFront.position.y = 400;
    scene.add(lightFront);

    // and another from the bottom
    lightBottom = new THREE.DirectionalLight(0xFFFFFF, 1.3);
    lightBottom.position.y = -240;
    scene.add(lightBottom);


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
    
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    cameraCube.aspect = window.innerWidth / window.innerHeight;
    cameraCube.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight );
    
}

function onDocumentMouseMove( event ) {
    
    mouseX = ( event.clientX - windowHalfX ) * 10;
    mouseY = ( event.clientY - windowHalfY ) * 10;
    
}

function animate() {
    requestAnimationFrame( animate );
    render();    
}

function render() {
    
    var timer = 0.0001 * Date.now();
  */  
/*
    for ( var i = 0, il = spheres.length; i < il; i ++ ) {
	var sphere = spheres[ i ];	
	sphere.position.x = 5000 * Math.cos( timer + i );
	sphere.position.y = 5000 * Math.sin( timer + i * 1.1 );
    }
*/
/*  
  camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05;
    //console.log('x:'+camera.position.x);
    //console.log('y:'+camera.position.y);
    camera.lookAt( scene.position );
    cameraCube.rotation.copy( camera.rotation );
    
    //renderer.render( sceneCube, cameraCube );
    renderer.render( scene, camera );    
}


*/