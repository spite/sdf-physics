function GPUSort( renderer, shader, width, height, format, type ) {

	this.renderer = renderer;
	this.shader = shader;
	this.orthoScene = new THREE.Scene();
	var fbo = new THREE.WebGLRenderTarget( width, height, {
		wrapS: THREE.RepeatWrapping,
		wrapT: THREE.RepeatWrapping,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: format || THREE.RGBAFormat,
		type: type || THREE.UnsignedByte,
		depthBuffer: false,
		stencilBuffer: false
	} );
	fbo.generateMipMaps = false;
	this.target = 0;
	this.targets = [];
	this.targets.push( fbo );
	for( var j = 1; j < 2; j++ ){
		this.targets.push( fbo.clone() );
	}
	this.orthoCamera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, .00001, 1000 );
	var geometry = new THREE.BufferGeometry();
	var vertices = new Float32Array([
		-1.0, -1.0, 0.0,
		 3.0, -1.0, 0.0,
		-1.0,  3.0, 0.0,
	]);
	var uvs = new Float32Array([
		0.0, 0.0,
		2.0, 0.0,
		0.0, 2.0,
	]);
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

	this.orthoQuad = new THREE.Mesh( geometry, this.shader );
	this.orthoQuad.scale.set( width, height, 1 );
	this.orthoScene.add( this.orthoQuad );
	this.front = this.targets[ 0 ];
	this.back = this.targets[ 1 ];

}

GPUSort.prototype.renderOddEven = function( passes ) {

	for (var j = 0; j < passes; j++ ) {

		var f = this.targets[ this.target ];

		this.shader.uniforms.isPassEven.value = true;
		this.renderer.render( this.orthoScene, this.orthoCamera, f );

		this.shader.uniforms.source.value = f;

		this.target = 1 - this.target;
		f = this.targets[ this.target ];

		this.shader.uniforms.isPassEven.value = false;
		this.renderer.render( this.orthoScene, this.orthoCamera, f );

		this.shader.uniforms.source.value = f;

		this.target = 1 - this.target;

	}

}

GPUSort.prototype.setSize = function( width, height ) {

	this.orthoQuad.scale.set( width, height, 1. );

	this.targets[ 0 ].setSize( width, height );
	this.targets[ 1 ].setSize( width, height );

	this.orthoQuad.scale.set( width, height, 1 );

	this.orthoCamera.left   = - width / 2;
	this.orthoCamera.right  =   width / 2;
	this.orthoCamera.top    =   height / 2;
	this.orthoCamera.bottom = - height / 2;
	this.orthoCamera.updateProjectionMatrix();

}
