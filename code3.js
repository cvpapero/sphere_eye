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
    
/*
    for ( var i = 0, il = spheres.length; i < il; i ++ ) {
	var sphere = spheres[ i ];	
	sphere.position.x = 5000 * Math.cos( timer + i );
	sphere.position.y = 5000 * Math.sin( timer + i * 1.1 );
    }
*/
    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05;
    //console.log('x:'+camera.position.x);
    //console.log('y:'+camera.position.y);
    camera.lookAt( scene.position );
    cameraCube.rotation.copy( camera.rotation );
    
    //renderer.render( sceneCube, cameraCube );
    renderer.render( scene, camera );    
}


