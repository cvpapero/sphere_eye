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
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.x = 6000;
    camera.position.x = -200;
    camera.position.z = 1000;

    cameraCube = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 100000 );

    scene = new THREE.Scene();
    sceneCube = new THREE.Scene(); 

    var url = "jpg/image.jpeg";

    var urls = [
	"jpg/h3.jpg", "jpg/h5.jpg",
	"jpg/h1.jpg", "jpg/h6.jpg",
	"jpg/h2.jpg", "jpg/h4.jpg"
    ];

    var sGeometry = new THREE.SphereGeometry( 500, 60, 40 );

    //var mapping = new THREE.UVMapping();
    var texture = THREE.ImageUtils.loadTexture( url );
    //var textureCube = THREE.ImageUtils.loadTextureCube( urls );
    var material = new THREE.MeshLambertMaterial( {color:0xffffff, map: texture } );
    //var material = new THREE.MeshBasicMaterial( {color:0xffffff, envMap: textureCube } );

    var mesh = new THREE.Mesh(sGeometry, material);
    mesh.scale.x = -1;

    scene.add( mesh );
    spheres.push( mesh );

    var ambientLight = new THREE.AmbientLight( 0x000000 );
    scene.add( ambientLight );
    
    var lights = [];
    lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
    lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
    lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );
    
    lights[0].position.set( 0, 200, 0 );
    lights[1].position.set( 100, 200, 100 );
    lights[2].position.set( -100, -200, -100 );
    
    scene.add( lights[0] );
    scene.add( lights[1] );
    scene.add( lights[2] );

/*
    //光源を作成
    var LIGHT_HEX = 0xffffff;//光の色
    var LIGHT_INTENSITY = 7;//光の強さ
    var LIGHT_DISTANCE = 700;//光の届く距離
    var LIGHT_ANGLE = Math.PI / 2;//照らす範囲角
    var LIGHT_EXPONENT = 1;//光の減衰度合い
    
    var light = new THREE.SpotLight(LIGHT_HEX,LIGHT_INTENSITY,LIGHT_DISTANCE,LIGHT_ANGLE,LIGHT_EXPONENT);
    light.target.position = new THREE.Vector3(200,0,0);
    light.position.set(0,100,500);
    scene.add( light );
*/

    // Skybox
    

    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = texture;
    
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
    //console.log('x:'+camera.position.x);
    //console.log('y:'+camera.position.y);
    camera.lookAt( scene.position );
    cameraCube.rotation.copy( camera.rotation );
    
    //renderer.render( sceneCube, cameraCube );
    renderer.render( scene, camera );    
}


