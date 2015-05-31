if ( ! Detector.webgl ) 
    Detector.addGetWebGLMessage();

var container;

var camera, scene, renderer;
var cameraCube, sceneCube;

var mesh, lightMesh, geometry;
var spheres = [];

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
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 1000;

    cameraCube = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );

    scene = new THREE.Scene();
    sceneCube = new THREE.Scene(); 

    var urls = [
	"jpg/h3.jpg", "jpg/h5.jpg",
	"jpg/h1.jpg", "jpg/h6.jpg",
	"jpg/h2.jpg", "jpg/h4.jpg"
    ];

    var sGeometry = new THREE.SphereGeometry( 500, 60, 40 );

    var textureCube = THREE.ImageUtils.loadTextureCube( urls );
    var material = new THREE.MeshBasicMaterial( {color:0xffffff, envMap: textureCube } );

    var mesh = new THREE.Mesh(sGeometry, material);

    scene.add(mesh);
    spheres.push( mesh );

    // Skybox
    
    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = textureCube;
    
    var material = new THREE.ShaderMaterial( {	
	fragmentShader: shader.fragmentShader,
	vertexShader: shader.vertexShader,
	uniforms: shader.uniforms,
	depthWrite: false,
	side: THREE.BackSide
    } ),
    
    mesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), material );
    sceneCube.add( mesh );

    //
    
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );
    
    //
    
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

    camera.lookAt( scene.position );
    cameraCube.rotation.copy( camera.rotation );
    
    //renderer.render( sceneCube, cameraCube );
    renderer.render( scene, camera );    
}

