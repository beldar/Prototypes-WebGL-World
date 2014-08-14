/* global Backbone, _, TRHEE, $ */

var AppView = Backbone.View.extend({
    el: 'body',

    events: {

    },

    initialize: function() {
        var self = this;
        this.width = $('#world').width();
        this.height = $('#world').width();
        this.windowHalfX = this.width / 2;
        this.windowHalfY = this.height / 2;
        this.container = $('#world').get(0);
        this.camera = new THREE.PerspectiveCamera( 60, this.width /this.height, 1, 2000 );
        this.camera.position.z = 500;

        this.scene = new THREE.Scene();

        this.group = new THREE.Object3D();
        this.scene.add( this.group );

        // earth

        var loader = new THREE.TextureLoader();
        loader.load( 'images/land_ocean_ice_cloud_2048.jpg', function ( texture ) {

            var geometry = new THREE.SphereGeometry( 200, 20, 20 );

            var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
            var mesh = new THREE.Mesh( geometry, material );
            self.group.add( mesh );

        } );

        // shadow

        var canvas = document.createElement( 'canvas' );
        canvas.width = 128;
        canvas.height = 128;

        var context = canvas.getContext( '2d' );
        var gradient = context.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 2
        );
        gradient.addColorStop( 0.1, 'rgba(210,210,210,1)' );
        gradient.addColorStop( 1, 'rgba(255,255,255,1)' );

        context.fillStyle = gradient;
        context.fillRect( 0, 0, canvas.width, canvas.height );

        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;

        var geometry = new THREE.PlaneGeometry( 300, 300, 3, 3 );
        var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.y = - 200;
        mesh.rotation.x = - Math.PI / 2;
        this.group.add( mesh );

        this.renderer = new THREE.CanvasRenderer();
        this.renderer.setClearColor( 0xffffff );
        this.renderer.setSize(this.width, this.height );

        this.container.appendChild( this.renderer.domElement );

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.container.appendChild( this.stats.domElement );

        $(window).resize(this.resize);

        this.animate();
    },

    resize: function() {
        this.width = $('#world').width();
        this.height = $('#world').width();
        this.windowHalfX = this.width / 2;
        this.windowHalfY = this.height / 2;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( this.width, this.height );
    },

    animate: function() {
        var self = this;

        requestAnimationFrame( function(){
            self.animate();
        });

        this.render();
        this.stats.update();
    },

    render: function() {
        /*this.camera.position.x += ( mouseX -  this.camera.position.x ) * 0.05;
        this.camera.position.y += ( - mouseY - this.camera.position.y ) * 0.05;
        this.camera.lookAt( this.scene.position );*/
        this.group.rotation.y -= 0.005;

        this.renderer.render( this.scene, this.camera );
    }
});

var App;

$(function() {
    App = new AppView();
});
