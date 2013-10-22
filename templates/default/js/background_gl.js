BackgroundGL.prototype = new Sprite();
function BackgroundGL($data){
	if ($data === undefined){
		$data = {};
	}
	
	this.context = (typeof $data.context == "undefined") ? false : $data.context;
	
	$c = new Canvas();
	try {
		delete this.lContext;
		this.lContext = $c.getContext( 'experimental-webgl', { preserveDrawingBuffer: true } );
	} catch( error ) { }
	if ( this.lContext == undefined || this.lContext == null ) {
		//No hay WebGL disponible :(
		return null;
	}
	
	this.is_visible = function(){
		return this.visible;
	}
	
	this.update = function(){
		if ( !this.lContext ) {
			//no hay contexto para laburar
			return;
		}
		
		if ( !this.is_visible() ) {
			//invisible. no hago nada.
			return;
		}
		
		this.parameters.time = Date.now() - this.parameters.startTime;
		
		// Set uniforms for custom shader
		this.lContext.useProgram( this.currentProgram );
		this.lContext.uniform1f( this.currentProgram.uniformsCache[ 'time' ], this.parameters.time / 1000 );
		this.lContext.uniform2f( this.currentProgram.uniformsCache[ 'mouse' ], this.parameters.mouseX, this.parameters.mouseY );
		this.lContext.uniform2f( this.currentProgram.uniformsCache[ 'resolution' ], this.parameters.screenWidth, this.parameters.screenHeight );
		this.lContext.uniform1i( this.currentProgram.uniformsCache[ 'backbuffer' ], 0 );
		this.lContext.uniform2f( this.currentProgram.uniformsCache[ 'surfaceSize' ], this.surface.width, this.surface.height );
		this.lContext.bindBuffer( this.lContext.ARRAY_BUFFER, this.surface.buffer );
		this.lContext.vertexAttribPointer( this.surface.positionAttribute, 2, this.lContext.FLOAT, false, 0, 0 );
		this.lContext.bindBuffer( this.lContext.ARRAY_BUFFER, this.buffer );
		this.lContext.vertexAttribPointer( this.vertexPosition, 2, this.lContext.FLOAT, false, 0, 0 );
		this.lContext.activeTexture( this.lContext.TEXTURE0 );
		this.lContext.bindTexture( this.lContext.TEXTURE_2D, this.backTarget.texture );

		// Render custom shader to front buffer
		this.lContext.bindFramebuffer( this.lContext.FRAMEBUFFER, this.frontTarget.framebuffer );
		this.lContext.clear( this.lContext.COLOR_BUFFER_BIT | this.lContext.DEPTH_BUFFER_BIT );
		this.lContext.drawArrays( this.lContext.TRIANGLES, 0, 6 );
		
		// Set uniforms for screen shader
		this.lContext.useProgram( this.screenProgram );
		this.lContext.uniform2f( this.screenProgram.uniformsCache[ 'resolution' ], this.parameters.screenWidth, this.parameters.screenHeight );
		this.lContext.uniform1i( this.screenProgram.uniformsCache[ 'texture' ], 1 );
		this.lContext.bindBuffer( this.lContext.ARRAY_BUFFER, this.buffer );
		this.lContext.vertexAttribPointer( this.screenVertexPosition, 2, this.lContext.FLOAT, false, 0, 0 );
		this.lContext.activeTexture( this.lContext.TEXTURE1 );
		this.lContext.bindTexture( this.lContext.TEXTURE_2D, this.frontTarget.texture );

		// Render front buffer to screen
		this.lContext.bindFramebuffer( this.lContext.FRAMEBUFFER, null );
		this.lContext.clear( this.lContext.COLOR_BUFFER_BIT | this.lContext.DEPTH_BUFFER_BIT );
		this.lContext.drawArrays( this.lContext.TRIANGLES, 0, 6 );

		// Swap buffers
		var tmp = this.frontTarget;
		this.frontTarget = this.backTarget;
		this.backTarget = tmp;
		
	}
	
	
	this.render = function(){
		if (this.context && this.context.canvas && this.is_visible()){
			this.context.canvas.width = this.context.canvas.width;
			this.context.drawImage(this.lContext.canvas, 0, 0, this.context.canvas.width, this.context.canvas.height);
		}
	}
	
	/* funciones y variables del motor de background GL */
	
	this.quality = ($data.calidad) ? $data.calidad : 2; 
	this.quality_levels = [ 0.5, 1, 2, 4, 8 ];
	
	this.buffer = null;
	this.currentProgram = null
	this.vertexPosition = null;
	this.screenVertexPosition= null;
	this.parameters = { startTime: Date.now(), time: 0, mouseX: 0.5, mouseY: 0.5, screenWidth: 0, screenHeight: 0 };
	this.surface = { centerX: 0, centerY: 0, width: 1, height: 1, isPanning: false, isZooming: false, lastX: 0, lastY: 0 };
	this.frontTarget = null;
	this.backTarget = null;
	this.screenProgram = null;
	this.getWebGL = null;
	this.resizer = {};
	this.compileOnChangeCode = true;
	
	this.fragmentShader = "#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform vec2 resolution;\nuniform sampler2D texture;\nvoid main() {\nvec2 uv = gl_FragCoord.xy / resolution.xy;\ngl_FragColor = texture2D( texture, uv );\n}";
	
	this.vertexShader = "\
		attribute vec3 position;\
		void main() {\
			gl_Position = vec4( position, 1.0 );\
		}\n";
	
	this.surfaceVertexShader = "\
		attribute vec3 position;\
		attribute vec2 surfacePosAttrib;\
		varying vec2 surfacePosition;\
		void main() {\
			surfacePosition = surfacePosAttrib;\
			gl_Position = vec4( position, 1.0 );\
		}\n";
	
	this.activeShaders = Array(
		"#ifdef GL_ES\nprecision mediump float;\n#endif\n// mods by dist, shrunk slightly by @danbri\n\nprecision mediump float;\nuniform float time;\nuniform vec2 mouse, resolution;\nvoid main(void) {\n\tvec2 uPos = ( gl_FragCoord.xy / resolution.xy );//normalize wrt y axis\n\tuPos -= .5;\n\tvec3 color = vec3(0.0);\n\tfloat vertColor = 0.0;\n\tfor( float i = 0.; i < 8.; ++i ) {\n\t\tuPos.y += sin( uPos.x*(i) + (time * i * i * 0.4) ) * 0.15;\n\t\tfloat fTemp = abs(0.5 / uPos.y / 60.0);\n\t\tvertColor += fTemp;\n\t\tcolor += vec3( fTemp*(7.0-i)/7.0, fTemp*i/10.0, pow(fTemp,0.9)*1.5 );\n\t}\n\tgl_FragColor = vec4(color, 1.0);\n}",
		"// by @eddbiddulph\n// depth of field. works best in the 1 or 0.5 modes...\n\n\nprecision lowp float;\n\n\nuniform float   time;\nuniform vec2    mouse;\nuniform vec2    resolution;\n\nconst vec3 eps = vec3(0.001, 0.0, 0.0);\n\nfloat f(vec3 p)\n{\n    return length(max(vec3(0.0, 0.0, 0.0), abs(mod(p, 1.0) - 0.5) - 0.15)) - 0.1;\n}\n\nvec3 n(vec3 p)\n{\n    float d = f(p);\n    return normalize(vec3(d - f(p - eps.xyz), d - f(p - eps.zxy), d - f(p - eps.yzx)));\n}\n\nvoid shade(vec3 p, vec3 e, vec3 norm, vec3 op, out vec3 diff, out vec3 spec)\n{\n    vec3 fp = floor(p), col = mix(vec3(0.2, 0.2, 0.2), vec3(1.0, 0.6, 0.6),\n                                abs(cos(fp.x) * sin(fp.y + 0.2) * sin(fp.z)));\n                                \n    float fres = pow(1.0 - dot(e, norm), 2.0) * 2.0, a = max(0.0, 1.0 - distance(p, op) * 0.1);\n\n    spec = vec3(fres) * a;\n    diff = col * a;\n}\n\nvec3 sceneNonRefl(vec3 ro, vec3 rd)\n{\n    vec3 old_ro = ro;\n\n    for(int i = 0; i < 60; ++i)\n    {\n        float dist = f(ro);\n        \n        if(abs(dist) < 0.001)\n            break;\n        \n        ro += rd * dist * 1.5;\n    }\n    \n    vec3 diff, spec;\n\n    shade(ro, -rd, n(ro), old_ro, diff, spec);\n\n    return diff;\n}\n\nvec3 sceneRefl(vec3 ro, vec3 rd)\n{\n    vec3 old_ro = ro;\n\n    for(int i = 0; i < 60; ++i)\n    {\n        float dist = f(ro);\n        \n        if(abs(dist) < 0.001)\n            break;\n        \n        ro += rd * dist * 1.5;\n    }\n    \n    vec3 norm = n(ro),\n         refl = sceneNonRefl(ro + norm * 0.01, reflect(norm, rd));\n    \n    vec3 diff, spec;\n\n    shade(ro, -rd, norm, old_ro, diff, spec);\n\n    return refl * spec + diff;\n}\n\nvec3 rotateX(vec3 v, float a)\n{\n    float ca = cos(a), sa = sin(a);\n    return vec3(v.x, ca * v.y - sa * v.z, sa * v.y + ca * v.z);\n}\n\nvec3 rotateY(vec3 v, float a)\n{\n    float ca = cos(a), sa = sin(a);\n    return vec3(ca * v.x - sa * v.z, v.y, sa * v.x + ca * v.z);\n}\n\nfloat rand1(vec2 co)\n{\n    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nfloat rand2(vec2 co)\n{\n    return fract(cos(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nconst int sum_num = 8;\n\nvoid main(void)\n{\n    float t = time, ax = -(mouse.y - 0.5) * 3.14159, ay = -(mouse.x - 0.5) * 3.14159;\n\n    // ray target on focus plane, in view space\n    vec3 targ;\n    targ.xy = (gl_FragCoord.xy / resolution.xy - 0.5) * vec2(resolution.x / resolution.y, 1.0) * 1.5;\n    targ.z = 2.0;\n\n    vec3 sum = vec3(0.0);\n\n    for(int i = 0; i < sum_num; ++i)\n    {\n        float fi = float(i) * 100.0;\n        // ray origin (eye point) in view space\n        vec3 ro = vec3(rand1(gl_FragCoord.xy + fi), rand2(gl_FragCoord.xy + fi), 0.0) * 0.06;\n        \n        // ray direction in view space\n        vec3 rd = normalize(targ - ro);\n\n        // perform view transforms (from view space to world space. scene is defined in world space)\n        rd = rotateY(rotateX(rd, ax), ay);\n        ro = rotateY(rotateX(ro, ax), ay) + vec3(cos(t * 0.2), sin(t * 0.15) * 0.1, t * 0.3);\n        \n        sum += sceneRefl(ro, rd);\n    }\n\n    gl_FragColor.a = 1.0;\n    gl_FragColor.rgb = sum / float(sum_num);\n}",
		"// simple 2D distance field visualizer\n// designed for testing and debugging\n// by @paniq\n//\n//\n// move mouse to blend views:\n// top left view: regular distance field\n// top right view: gradient (normal) field\n// bottom left view: auto warp-adjusted distance field\n// bottom right view: warp (first derivative of distance) field\n\n#ifdef GL_ES\nprecision highp float;\n#endif\n\n// higher is sharper\n#define CONTRAST 1.0\n// higher is more dramatic\n#define WARP_EMPHASIS 8.0\n// higher is smaller\n#define ZOOM 8.0\n// gradient sampling delta\n#define DELTA (3.0/resolution.y)\n\n// comment for 2d\n#define RENDER3D\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\n\n// math\n//////\n\n// useful transformations:\n// abs(x) = max(x, -x)\n// sqrt(a)*sqrt(b) = sqrt(a*b)\n// cos(x) = cos(-x)\n// -sin(x) = sin(-x)\n// -tan(x) = tan(-x)\n// cos(x - pi*0.5) = sin(x)\n// sin(x + pi*0.5) = cos(x)\n// tan(x) = sin(x)/cos(x)\n\n\n\nvec2 noise(vec2 n) {\n    vec2 ret;\n    ret.x=fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);\n    ret.y=fract(cos(dot(n.yx, vec2(34.9865, 65.946)))* 28618.3756);\n    return ret;\n}\n\nfloat saw(float v) {\n    return mod(v, 1.0);\n}\n\nfloat tri(float v) {\n    return abs(mod(v, 2.0) - 1.0);\n}\n\nfloat tris(float v) {\n    return 1.0-abs(2.0-mod(v+1.0, 4.0));\n}\n\n#define LOG2 0.6931471805599453\n\nfloat logscale(float v) {\n    return pow(2.0, floor(log(v) / LOG2));\n}\n    \nfloat logsaw(float v) {\n    return v-pow(2.0, floor(log(v) / LOG2));\n}\n\n// built-in:\n// float radians()\n\n// some geometry tools\n///////\n\nfloat sphere(vec2 d, float radius) {\n    return length(d) - radius;\n}\n\nfloat hexagon(vec2 d, float r)\n{\n    vec2 q = abs(d);\n    float p = dot(q, vec2(0.866024,  0.5));\n    return max(p, q.y) - r;\n}\n\nfloat crossrect(vec2 d, vec2 s) {\n    vec2 u = abs(d) - s;\n    return min(u.x, u.y);\n}\n\nfloat rect(vec2 d, vec2 s) {\n    vec2 u = abs(d) - s;\n    return max(u.x, u.y);\n}\n\n// unsigned - causes problems in particular cases\nfloat roundrect(vec2 d, vec2 s, float r) {\n    vec2 u = abs(d) - s;\n    return length(max(u,0.0))-r;\n}\n\nfloat outline(float d, float r) {\n    return abs(d) - r;\n}\n\n// boolean operations\n///////\n\nfloat bool_union(float a, float b) {\n    return min(a,b);\n}\n\nfloat bool_intersection(float a, float b) {\n    return max(a, b);\n}\n\nfloat bool_subtraction(float a, float b) {\n    return max(a,-b);\n}\n\nfloat morph(float a, float b, float n) {\n    return mix(a, b, n);\n}\n\n// transforms\n///////\n\nvec2 translate(vec2 p, vec2 origin) {\n    return p - origin;\n}\n\nvec2 rotate(vec2 p, float angle) {\n    float c = cos(-angle);\n    float s = sin(-angle);\n    return vec2(\n        p.x * c - p.y * s,\n        p.y * c + p.x * s);\n}\n\nvec2 repeat(vec2 p, vec2 s) {\n    vec2 c = s*0.5;\n    return mod(p + c, s) - c;\n}\n\n// fold space along normal\nvec2 fold(vec2 p, vec2 n) {\n    return p - 2.0 * min(0.0, dot(p, n)) * n;\n}\n\n// fold space along angle\nvec2 fold(vec2 p, float angle) {\n    return fold(p, vec2(cos(angle), sin(angle)));\n}\n\n// this function can't be implemented\n// vec2 scale(float (*func)(vec2), vec2 p, float s) {\n//  return func(p / s) * s;\n// }\n\n// your custom evaluator here\n//////\n\nconst float Scale = 2.0;\nvec2 Offset = vec2(1.0, 0.58);\n\n#define ITERS 6\nfloat sierpinski(vec2 z)\n{\n    float r;\n    \n    for (int n = 0; n < ITERS; n++) {\n       z = fold(z, radians(0.0));\n       z = fold(z, radians(60.0));\n       z = z*Scale - Offset*(Scale-1.0);\n       z = rotate(z, radians(time*5.0));    \n    }\n    return (length(z) ) * pow(Scale, -float(ITERS)) - 0.015;\n}\n\nfloat triangle(vec2 p, float r) {\n    return max((p.y + abs(p.x) * sqrt(3.0))*0.5, -p.y) - r;\n}\n\nconst float pi = 3.14159;\n\nfloat polar_coord_example(vec2 p) {\n p.x -= 1.0;\n    float s = 30.0 / pi;\n    float d = length(p);\n    float a = atan(p.y, p.x);\n    p = vec2(a, log(d)) * s;\n    float de = d / s;\n    vec2 rp = repeat(p, vec2(1.0));\n    float grid = rect(rp, vec2(0.3));\n    return grid * de;\n}\n\nfloat polar_distance(vec2 a, vec2 b) {\n    return sqrt(a.x*a.x + b.x*b.x - 2.0*a.x*b.x*cos(a.y - b.y));\n}\n\nfloat ringslice(vec2 p, vec2 r, float a) {\n    float d = length(p);\n        float u = abs(d - r.s) - r.t;\n    float v = abs(p.y * cos(a)) - p.x * sin(a);\n    return max(u, v);\n}\n\n// de(x,y) = abs(fx-y) / sqrt(1.0 + pow(dfx / dx,2.0))\n\nfloat hexagon2(vec2 d, float r)\n{\n    vec2 q = abs(d);\n    float p = dot(q, vec2(0.866024,  0.5));\n    return max(p, q.y) - r;\n}\n\nfloat hexatiles(vec2 d) {\n\td.x *= 0.8660254037844386;\n\tvec2 p = mod(d, vec2(3.0, 2.0));\n\t\n\tvec2 p0 = abs(p - vec2(1.5, 1.0));\n\tvec2 p1 = abs(p0 - vec2(1.5, 1.0));\n\t\n\treturn min(max(p0.x + p0.y*0.5, p0.y),max(p1.x + p1.y*0.5, p1.y));\n}\n\n// final evaluator\nfloat position_to_distance(vec2 o) {\n\tfloat shape1 = length(o) - tri(time*0.5)*12.0;\n\tfloat shape2 = hexatiles(o + vec2(time*5.0,0.0));\n\treturn max(mix(shape1, shape2, 0.9), shape1);\n}\n\n// 3d converter\nfloat position_to_distance(vec3 o) {\n\treturn min(max(position_to_distance(o.xz), o.y), o.y + 1.0);\n}\n\n// engine\n///////\n        \n\n// gradient function\nvec2 position_to_normal(vec2 p) {\n    return normalize(vec2(\n        position_to_distance(vec2(p.x+DELTA, p.y)) - position_to_distance(vec2(p.x-DELTA, p.y)),\n        position_to_distance(vec2(p.x, p.y+DELTA)) - position_to_distance(vec2(p.x, p.y-DELTA))\n    ));\n}\n\n// warp function\nfloat position_to_warp(vec2 p) {\n    return length(vec2(\n        (position_to_distance(vec2(p.x+DELTA, p.y)) - position_to_distance(vec2(p.x-DELTA, p.y))),\n        (position_to_distance(vec2(p.x, p.y+DELTA)) - position_to_distance(vec2(p.x, p.y-DELTA)))\n    ) / (2.0*DELTA));\n}\n\nfloat fixed_position_to_distance(vec2 p) {\n    float warp = position_to_warp(p);\n    float distance = position_to_distance(p);\n    return distance / warp;\n}\n\n\n// distance field shader\n// by default, full red is exactly 0, full blue is >= 1, full green is <= -1\nvec3 distance_to_color(float d) {\n    d *= CONTRAST;\n    \n    float border = clamp(1.0 - abs(d), 0.0, 1.0);\n    float inside = max(-d, 0.0);\n    float outside = max(d, 0.0);\n    \n    return vec3(border, inside, outside);\n}\n\n// distance field outline shader\nvec3 shade_color(float d) {\n    float s = d * (resolution.y / 3.0);\n    return vec3(s);\n}\n    \n// gradient field shader\nvec3 normal_to_color(vec2 n) {\n    n = (n + 1.0) / 2.0;\n    return vec3(n.x, n.y, 0.5);\n}\n\n// warp field shader\n// green: perfect (~1)\n// red: distance too large (> 1), need scale down\n// blue: distance too small (< 1), need scale up\nvec3 warp_to_color(float w) {\n    w = (w - 1.0) * WARP_EMPHASIS;\n    \n    float perfect = clamp(1.0 - abs(w), 0.0, 1.0);\n    float toosmall = max(-w, 0.0);\n    float toobig = max(w, 0.0);\n    \n    return vec3(toobig, perfect, toosmall);\n}\n\nvoid render_2d() {\n    vec2 proj = vec2(resolution.x * ZOOM / resolution.y, ZOOM);\n    vec2 position = (( gl_FragCoord.xy / resolution.xy )*2.0 - 1.0) * proj;\n    \n    vec2 axis = clamp(mouse * 2.0 - 0.5, 0.0, 1.0);\n\n    vec3 distance_color = clamp(distance_to_color(position_to_distance(position)), 0.0, 1.0);\n    vec3 normal_color = clamp(normal_to_color(position_to_normal(position)), 0.0, 1.0);\n    vec3 fixed_color = clamp(shade_color(position_to_distance(position)), 0.0, 1.0);\n    vec3 warp_color = clamp(warp_to_color(position_to_warp(position)), 0.0, 1.0);\n    \n    vec3 color = mix(\n        mix(fixed_color, warp_color, axis.x),\n        mix(distance_color, normal_color, axis.x),\n        axis.y);\n    \n    gl_FragColor = vec4(color, 1.0);\n\n}\n\nvoid render_3d() {\n\tvec2 p = -1. + 2.*gl_FragCoord.xy / resolution.xy;\n\tp.x *= resolution.x/resolution.y;\n\t\n\t//Camera animation\n  vec3 vuv=vec3(0,1,0);//Change camere up vector here\n  vec3 vrp=vec3(0,1,0); //Change camere view here\n  vec3 prp=vec3(sin(time*0.3)*8.0,4,cos(time*0.3)*8.0); //Change camera path position here\n\n  //Camera setup\n  vec3 vpn=normalize(vrp-prp);\n  vec3 u=normalize(cross(vuv,vpn));\n  vec3 v=cross(vpn,u);\n  vec3 vcv=(prp+vpn);\n  vec3 scrCoord=vcv+p.x*u+p.y*v;\n  vec3 scp=normalize(scrCoord-prp);\n\n  //Raymarching\n  const vec3 e=vec3(0.1,0,0);\n  const float maxd=32.0; //Max depth\n\n  float s=0.1;\n  vec3 c,p1,n;\n\n  float f=1.0;\n  float steps = 1.0;\n\t\n  for(int i=0;i<32;i++){\n    if (abs(s)<.01||f>maxd) {\n\t    steps = float(i)/32.0;\n\t    break; \n    }\n    f+=s;\n    p1=prp+scp*f;\n    s=position_to_distance(p1);\n  }\n  \t\n\t//replacing if/else with ternary to try out with apple's \"core image\"\n\tc=vec3(.5,0.5,0.5);\n    \tn=normalize(\n      \tvec3(s-position_to_distance(p1-e.xyy),\n           s-position_to_distance(p1-e.yxy),\n           s-position_to_distance(p1-e.yyx)));\n    \tfloat b=dot(n,normalize(prp-p1));\n    \tvec4 tex=vec4((b*c+pow(b,8.0))*(1.0-f*.01),1.0);\n\tvec4 background=vec4(0,0,0,1);\n\t\n\tvec4 Color=(f<maxd)?tex:background;\n\tColor.rgb *= 1.0 - steps;\n\tColor.r = smoothstep(0.0, 1.0, Color.r);\n\tColor.g = max(smoothstep(-0.1, 1.0, Color.b), 0.0);\n\t\n  \t/*if (f<maxd){\n      \tc=vec3(.3,0.5,0.8);\n    \tn=normalize(\n      \tvec3(s-opDisplace(p1-e.xyy),\n           s-opDisplace(p1-e.yxy),\n           s-opDisplace(p1-e.yyx)));\n    \tfloat b=dot(n,normalize(prp-p1));\n   \tgl_FragColor=vec4((b*c+pow(b,8.0))*(1.0-f*.01),1.0);\n  \t}\n  \telse gl_FragColor=vec4(0,0,0,1);\n\t*/\n//to use with core image, just replace with \"return Color\"\ngl_FragColor=Color;\t\n}\n\nvoid main() {\n#ifdef RENDER3D\n\trender_3d();\n#else\n\trender_2d();\n#endif\n}\n",
		"#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\nvoid main( void ) {\n\n\tvec2 position = ( gl_FragCoord.xy / resolution.xy ) + mouse / 4.0;\n\n\tfloat color = 0.0;\n\tcolor += sin( position.x * cos( time / 15.0 ) * 80.0 ) + cos( position.y * cos( time / 15.0 ) * 10.0 );\n\tcolor += sin( position.y * sin( time / 10.0 ) * 40.0 ) + cos( position.x * sin( time / 25.0 ) * 40.0 );\n\tcolor += sin( position.x * sin( time / 5.0 ) * 10.0 ) + sin( position.y * sin( time / 35.0 ) * 80.0 );\n\tcolor *= sin( time / 10.0 ) * 0.5;\n\n\tgl_FragColor = vec4( vec3( color, color * 0.5, sin( color + time / 3.0 ) * 0.75 ), 5.0 );\n\n}",
		"#ifdef GL_ES\nprecision mediump float;\n#endif\n\n// added a little hack to effectively keep the thickness of the white lines constant in screen-space, by upscaling based on distance.\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\nvec3 rotXY(vec3 p, vec2 rad) {\n\tvec2 s = sin(rad);\n\tvec2 c = cos(rad);\n\t\n\tmat3 m = mat3(\n\t\tc.y, 0.0, -s.y,\n\t\t-s.x * s.y, c.x, -s.x * c.y,\n\t\tc.x * s.y, s.x, c.x * c.y\n\t);\n\treturn m * p;\n}\n\nvec2 repeat(vec2 p, float n) {\n\tvec2 np = p * n;\n\tvec2 npfrct = fract(np);\n\tvec2 npreal = np - npfrct;\n\tnp.x += fract(npreal.y * 0.5);\n\t\n\treturn fract(np) * 2.0 - 1.0;\n}\n\nfloat hexDistance(vec2 ip) {\n\tconst float SQRT3 = 1.732050807568877;\n\tconst vec2 TRIG30 = vec2(0.5, 0.866025403784439); //x:sine, y:cos\n\t\n\tvec2 p = abs(ip * vec2(SQRT3 * 0.5, 0.75));\n\tfloat d = dot(p, vec2(-TRIG30.x, TRIG30.y)) - SQRT3 * 0.25;\n\t\n\treturn (d > 0.0)? min(d, (SQRT3 * 0.5 - p.x)) : min(-d, p.x);\n}\n\nfloat smoothEdge(float edge, float margin, float x) {\n\treturn smoothstep(edge - margin, edge + margin, x);\n}\n\nvoid main(void) {\n\tconst float PI = 3.1415926535;\n\tvec3 rgb;\n\t\n\tvec2 nsc = (gl_FragCoord.xy - resolution * 0.5) / resolution.yy * 2.0;\n\tvec3 dir = normalize(vec3(nsc, -2.0));\n\tdir = rotXY(dir, vec2((sin(time*0.25)*0.5 ) * PI * 0.35));\n\tvec2 uv = vec2(atan(dir.y, dir.x) / (PI * 2.0) + 0.5, dir.z / length(dir.xy));\n\t\n\tvec2 pos = uv * vec2(1.0, 0.2) - vec2(time * 0.05, time * 0.5);\n\t\n\tvec2 p = repeat(pos, 16.0);\n\t\n\tfloat d = hexDistance(p);\n\tfloat dist = dir.z/length(dir.xy);\n\td/=-dist;\n\tfloat fade = 1.0 / pow(1.0 / length(dir.xy) * 0.3, 2.0);\n\tfade = clamp(fade, 0.0, 1.0);\n\trgb  = mix(vec3(1.0)*fade, vec3(0.0), smoothEdge(0.03, 0.01, d));\n\trgb += mix(vec3(1.0, 0.0, 1.0)*fade, vec3(0.0), smoothEdge(0.03, 0.5, d)) * 0.5;\n\trgb += mix(vec3(1.0, 0.0, 0.0)*fade, vec3(0.0), smoothEdge(0.03, 1.0, d)) * 0.25;\n\t\n\tgl_FragColor = vec4(rgb, 1.0);\n\t\n}\n",
		"#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\n\nvoid main( void )\n{\n\n\tvec2 uPos = ( gl_FragCoord.xy / resolution.xy );//normalize wrt y axis\n\t//uPos -= vec2((resolution.x/resolution.y)/0.0, 2.0);//shift origin to center\n\t\n\tuPos.x -= 0.5;\n\t\n\tfloat vertColor = 0.0;\n\tfor( float i = 0.0; i < 10.0; ++i )\n\t{\n\t\tfloat t = time * (i + 0.9* uPos.y * uPos.x);\n\t\n\t\tuPos.x += cos( uPos.y + t ) * 0.1080;\n\t\n\t\tfloat fTemp = abs(1.0 / uPos.x / 100.0);\n\t\tvertColor += fTemp;\n\t}\n\t\n\tvec4 color = vec4( vertColor*0.5, vertColor * sin(time), vertColor * 2.5, 1.0 );\n\tgl_FragColor = color;\n}",
		"// domain warping on noise. about : http://www.iquilezles.org/www/articles/warp/warp.htm\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\nmat2 m = mat2( 0.80,  0.60, -0.60,  0.9 );\n\nfloat hash( float n )\n{\n    return fract(sin(n)*7919.0);//*\n}\n\nfloat noise( in vec2 x )\n{\n    vec2 p = floor(x);\n    vec2 f = fract(x);\n    f = f*f*(3.0-2.0*f);\n    float n = p.x + p.y*7919.0;\n    float res = mix(mix( hash(n+ 0.0), hash(n +1.0),f.x), mix( hash(n+ 7919.0), hash(n+ 7920.0),f.x),f.y);\n    return res;\n}\n\nint mod(int a, int b) {\n\treturn a - ((a / b) * b);\n}\n\nfloat fbm( vec2 p ) {\n    p*=3.;\n    float f = 0.0;\n        f += 0.25000*noise( p ); p = m*p*0.02;\n        f += 0.12500*noise( p ); p = m*p*0.13;\n        f += 0.06250*noise( p ); p = m*p*0.01;\n        f += 0.03125*noise( p ); p = m*p*0.04;\n        f += 0.01500*noise( p );\n    return f/0.38375;\n}\n\nvec2 r(vec2 v, float a) {\n\tmat2 m = mat2 (cos(a), -sin(a),\n\t\t       -sin(a), cos(a*a/20000.) );\n\treturn m*v;\n}\n\nvoid main( void ) {\n\tvec3 col;\n\tvec2 p=-1.0+2.0*gl_FragCoord.xy/resolution.xy;\n\tp.x*=resolution.x/resolution.y;\n\n        vec2 dx1 = vec2(1.0,0.0);\t\n\tvec2 dy1 = vec2(1.2,1.3);\n\t\n\tvec2 dx2 = vec2(1.7,1.2);\n\tvec2 dy2 = vec2(1.3,1.8);\n\t\n\tdx1 = r(dx1,time/12.);\n\t//dy1 = r(dy1,time/8.);\n\t\n\t//dx2 = r(dx2,time/120.);\n\t//dy2 = r(dy2,time/170.);\n\t\n\tvec2 q = vec2(fbm( p + dx1 ) , \n\t\t      fbm( p + dy1 ) );\n\t\n\tvec2 r = vec2( fbm( p + 1.5*q + dx2 ),\n                       fbm( p + 1.5*q + dy2 ) );\n\n\tvec2 s = vec2( fbm( p + 1.5*r + dx1+dx2 ),\n                       fbm( p + 1.5*r + dy2+dy2 ) );\n\t\t\n\tfloat v = fbm( p + 4. * s );\n\tcol = v * vec3(q.x,r.x,s.x) + vec3(q.y,r.y,s.y);\n\tgl_FragColor = vec4( col, 1. );\n\n}",
		"#ifdef GL_ES\nprecision highp float;\n#endif\n\n// moded by seb.cc\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\nconst float LINES = 6.0;\nconst float BALLS = 6.0;\n\n//MoltenMetal by CuriousChettai@gmail.com\n//Linux fix\n\nvoid main( void ) {  \n\tvec2 uPos = ( gl_FragCoord.xy / resolution.y );//normalize wrt y axis\n\tuPos -= vec2((resolution.x/resolution.y)/2.0, 0.5);//shift origin to center\n\t\n\tfloat vertColor = 0.0;\n\t//*\n\tfor(float i=0.0; i<LINES; i++){\n\t\tfloat t = time*(i*0.1+1.)/3.0 + (i*0.1+0.5); \n\t\tuPos.y += sin(t+uPos.x*2.0)*0.45 ;\n\t\tuPos.x += sin(-t+uPos.y*3.0)*0.25 ;\n\t\tfloat value = sin(uPos.y*8.0*0.5)+sin(uPos.x*6.1-t);\n\t\tfloat stripColor = 1.0/sqrt(abs(value));\n\t\tvertColor += stripColor/10.0;\n\t}\n\t//*/\n\tfloat oColor=0.0;\n\tfor (float i=0.0; i<BALLS; i++) {\n\t\tfloat t=time*1.3+i*2.5;\n\t\tvec2 ball=vec2(sin(t*0.3)*sin(t*0.1+1.)*sin(t*0.56+0.24),sin(t*0.11+0.04)*sin(t*0.24+0.4)*sin(t*0.18+0.4));\n\t\tfloat d=distance(uPos,ball);\n\t\toColor+=0.07/d;\n\t}\t\n\t\n\tfloat temp = vertColor;\t\n\tvec3 color = vec3(temp*max(0.1,abs(sin(time*0.1))), max(0.1,(temp-oColor)*abs(sin(time*0.03+1.))), max(0.1,oColor));\t\n\t//color *= color.g+color.g+color.b;\n\tgl_FragColor = vec4(color, 1.0);\n}",
		"// by rotwang, overlapping pixels in different sizes.\n// drifting around by @emackey\n// \"tunnelized\" by kabuto\n// rotwang: @mod* variation\n\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\nconst float PI = 3.1415926535;\nconst float TWOPI = PI*2.0;\n\nfloat rand(vec2 co){\n    return fract(sin(dot(co.xy ,vec2(11.9898,78.233))) * 43758.5453);\n}\n\nvoid main( void ) {\n\n\tvec2 dir = vec2(0, sin(time * 0.1) * .15);\n\tvec2 travel = time * vec2(-0.04, 0);\n\tfloat aspect = resolution.x / resolution.y;\n\tvec2 p =  ( gl_FragCoord.xy - resolution.xy*.5) / resolution.y;\n\tfloat angle = (atan(p.x, p.y)+PI)/TWOPI;\n\tvec2 pos1 = vec2(-.1/length(p),atan(p.y,p.x)/(2.*3.1415926));\n\tvec2 pos = pos1 + dir + travel;\n\t\n\t\n\tvec3 clr = vec3(0.0);\n\tfor(int i=0;i<8;i++)\n\t{\n\t\tpos.y = fract(pos.y);\n\t\tfloat n = pow(4.0-float(i), 2.0)*2.;\n\t\tvec2 pos_z = floor(pos*n);\n\t\tfloat a = 1.0-step(0.1, rand(pos_z))*angle*2.0;\n\t\tfloat rr = rand(pos_z)*a;\n\t\tfloat gg = rand(pos_z+n)*a;\n\t\tfloat bb = rand(pos_z+n+n)*a;\n\t\t\n\t\tvec3 clr_a = vec3(rr, gg, bb);\n\t\tclr += clr_a*clr_a/4.0;\n\t\tpos += dir + travel;\n\t}\n\t\n\t//clr = sqrt(clr);\n\tclr *= -pos1.x;\n\tclr += length(pos1)*vec3(0.9, 0.3,0.2);\n\tclr *= 1.0-length(p*p);\n\tgl_FragColor = vec4( clr, 1.0 );\n\t\n}",
		"// added a bit of burning color\n\n#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\n\n// Trapped by curiouschettai\n\nvoid main( void ) {  \n\tvec2 uPos = ( gl_FragCoord.xy / resolution.y );//normalize wrt y axis\n\tuPos -= vec2((resolution.x/resolution.y)/2.0, 0.5);//shift origin to center\n\t\n\tfloat multiplier = 0.005; // Grosseur\n\tconst float step = 0.2; //segmentation\n\tconst float loop = 100.0; //Longueur\n\tconst float timeSCale = 1.05; // Vitesse\n\t\n\tvec3 blueGodColor = vec3(0.0);\n\tfor(float i=1.0;i<loop;i++){\t\t\n\t\tfloat t = time*timeSCale-step*i;\n\t\tvec2 point = vec2(0.75*sin(t), 0.5*sin(t*.02));\n\t\tpoint += vec2(0.75*cos(t*0.1), 0.5*sin(t*0.3));\n\t\tpoint /= 4. * sin(i);\n\t\tfloat componentColor= multiplier/((uPos.x-point.x)*(uPos.x-point.x) + (uPos.y-point.y)*(uPos.y-point.y))/i;\n\t\tblueGodColor += vec3(componentColor/2.0, componentColor/3.0, componentColor);\n\t}\n\t\n\t\n\tvec3 color = vec3(0,0,0);\n\tcolor += pow(blueGodColor,vec3(1.1,1.1,0.8));\n   \n\t\n\tgl_FragColor = vec4(color, 1.0);\n}",
		"// By @paulofalcao\n//\n// Blobs\n\n#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\nfloat makePoint(float x,float y,float fx,float fy,float sx,float sy,float t){\n   float xx=x+sin(t*fx)*sx;\n   float yy=y+cos(t*fy)*sy;\n   return 1.0/sqrt(xx*xx+yy*yy);\n}\n\nvoid main( void ) {\n\n   vec2 p=(gl_FragCoord.xy/resolution.x)*2.0-vec2(1.0,resolution.y/resolution.x);\n\n   p=p*2.0;\n   \n   float x=p.x;\n   float y=p.y;\n\n   float a=\n       makePoint(x,y,3.3,2.9,0.3,0.3,time);\n   a=a+makePoint(x,y,3.9,2.0,0.4,0.4,time);\n   a=a+makePoint(x,y,0.8,0.7,0.4,0.5,time);\n   a=a+makePoint(x,y,2.3,0.1,0.6,0.3,time);\n   a=a+makePoint(x,y,0.8,1.7,0.5,0.4,time);\n   a=a+makePoint(x,y,0.3,1.0,0.4,0.4,time);\n   a=a+makePoint(x,y,1.4,1.7,0.4,0.5,time);\n   a=a+makePoint(x,y,1.3,2.1,0.6,0.3,time);\n   a=a+makePoint(x,y,1.8,1.7,0.5,0.4,time);   \n   \n   float b=\n       makePoint(x,y,1.2,1.9,0.3,0.3,time);\n   b=b+makePoint(x,y,0.7,2.7,0.4,0.4,time);\n   b=b+makePoint(x,y,1.4,0.6,0.4,0.5,time);\n   b=b+makePoint(x,y,2.6,0.4,0.6,0.3,time);\n   b=b+makePoint(x,y,0.7,1.4,0.5,0.4,time);\n   b=b+makePoint(x,y,0.7,1.7,0.4,0.4,time);\n   b=b+makePoint(x,y,0.8,0.5,0.4,0.5,time);\n   b=b+makePoint(x,y,1.4,0.9,0.6,0.3,time);\n   b=b+makePoint(x,y,0.7,1.3,0.5,0.4,time);\n\n   float c=\n       makePoint(x,y,3.7,0.3,0.3,0.3,time);\n   c=c+makePoint(x,y,1.9,1.3,0.4,0.4,time);\n   c=c+makePoint(x,y,0.8,0.9,0.4,0.5,time);\n   c=c+makePoint(x,y,1.2,1.7,0.6,0.3,time);\n   c=c+makePoint(x,y,0.3,0.6,0.5,0.4,time);\n   c=c+makePoint(x,y,0.3,0.3,0.4,0.4,time);\n   c=c+makePoint(x,y,1.4,0.8,0.4,0.5,time);\n   c=c+makePoint(x,y,0.2,0.6,0.6,0.3,time);\n   c=c+makePoint(x,y,1.3,0.5,0.5,0.4,time);\n   \n   vec3 d=vec3(a,b,c)/32.0;\n   \n   gl_FragColor = vec4(d.x,d.y,d.z,1.0);\n}",
		"// bars - thygate@gmail.com\n\n// rotation and color mix modifications by malc (mlashley@gmail.com)\n\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\nvec2 position;\nvec4 color;\n\nfloat c = cos(time/2.0);\nfloat s = sin(time/2.0);\nmat2 R = mat2(c,-s,s,-c);\n\nfloat barsize = 0.15;\nfloat barsangle = 1.0;\n\nvec4 mixcol(float value, float r, float g, float b)\n{\n\treturn vec4(value * r, value * g, value * b, value);\n}\n\nvoid bar(float pos, float r, float g, float b)\n{\n\t if ((position.y <= pos + barsize) && (position.y >= pos - barsize))\n\t\tcolor = (color * color.a) + mixcol(1.0 - abs(pos - position.y) / barsize, r, g, b);\n}\n\nvoid main( void ) {\n\n\tposition = ( gl_FragCoord.xy / resolution.xy );\n\tposition = position * vec2(2.0) - vec2(1.0);\n\tposition = position * R; \t\t\n\t\t\n\tcolor = vec4(0., 0., 0., 0.);\n\tfloat t = mod(time * 0.1, 10.) + time;\n\n\tbar(sin(t), \t\t\t1.0, 0.0, 0.0);\n\tbar(sin(t+barsangle/6.*2.), \t1.0, 1.0, 0.0);\n\tbar(sin(t+barsangle/6.*4.),  0.0, 1.0, 0.0);\n\tbar(sin(t+barsangle/6.*6.),  0.0, 1.0, 1.0);\n\tbar(sin(t+barsangle/6.*8.),  0.5, 0.0, 1.0);\n\tbar(sin(t+barsangle/6.*10.),  1.0, 0.0, 1.0);\n\t\n\tgl_FragColor = color;\n\n}",
		"// \"Sunset on the sea\" Ray Marching (Sphere Tracing) & Ray Tracing experiment by Riccardo Gerosa aka h3r3 \n// Blog: http://www.postronic.org/h3/ G+: https://plus.google.com/u/0/117369239966730363327 Twitter: @h3r3 http://twitter.com/#!/h3r3\n// More information about this shader can be found here: http://www.postronic.org/h3/pid65.html\n// This GLSL shader is based on the work of T Whitted, JC Hart, K Perlin, I Quilez and many others\n// This shader uses a Simplex Noise implementation by and I McEwan, A Arts (more info below)\n// If you modify this code please update this header\n// (modified, alpha=1.0)\n\n\n// Added really cheap realism because it really looked bland without it\n// Anonymous\n\n\nprecision highp float;\n\nconst bool USE_MOUSE = true; // Set this to true for God Mode :)\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\nconst float PI = 3.14159265;\nconst float MAX_RAYMARCH_DIST = 150.0;\nconst float MIN_RAYMARCH_DELTA = 0.00015; \nconst float GRADIENT_DELTA = 0.015;\nfloat waveHeight1 = 0.020;\nfloat waveHeight2 = 0.018;\nfloat waveHeight3 = 0.016;\n\n// --------------------- START of SIMPLEX NOISE\n//\n// Description : Array and textureless GLSL 2D simplex noise function.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n// \n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289(vec2 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute(vec3 x) {\n  return mod289(((x*34.0)+1.0)*x);\n}\n\nfloat snoise(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626,  // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod289(i); // Avoid truncation effects in permutation\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n\t\t+ i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\n// --------------------- END of SIMPLEX NOISE\n\n\nfloat map(vec3 p) {\n\t//asdf\n\tfloat A = 0.30;\n\tfloat B = 0.50;\n\tfloat r = p.y+0.1;\n\tfor (int j = 0; j < 8; j++) {\n\t\tr+= B*snoise(A*(p.xz)+time*0.75);\n\t\tA*=2.45458;\n\t\tB*=0.42075;\n\t}\n\t\n\treturn r;\n}\n\nvec3 gradientNormalFast(vec3 p, float map_p) {\n    return normalize(vec3(\n        map_p - map(p - vec3(GRADIENT_DELTA, 0, 0)),\n        map_p - map(p - vec3(0, GRADIENT_DELTA, 0)),\n        map_p - map(p - vec3(0, 0, GRADIENT_DELTA))));\n}\n\nfloat intersect(vec3 p, vec3 ray_dir, out float map_p, out int iterations) {\n\titerations = 0;\n\tif (ray_dir.y >= 0.0) { return -1.0; } // to see the sea you have to look down\n\t\n\tfloat zHigh = - 1.5;\n\tfloat zLow = - 0.5 - ((waveHeight1 + waveHeight2 + waveHeight3) * 2.0);\n\tfloat distMin = (zHigh - p.y) / ray_dir.y;\n\tfloat distMax = (zLow - p.y) / ray_dir.y;\n\n\tfloat distMid = distMin;\n\tfor (int i = 0; i < 50; i++) {\n\t\titerations++;\n\t\tdistMid += max(0.05 + float(i) * 0.002, map_p);\n\t\tmap_p = map(p + ray_dir * distMid);\n\t\tif (map_p > 0.0) { \n\t\t\tdistMin = distMid + map_p;\n\t\t} else { \n\t\t\tdistMax = distMid + map_p;\n\t\t\t// interval found, now bisect inside it\n\t\t\tfor (int i = 0; i < 10; i++) {\n\t\t\t\titerations++;\n\t\t\t\tdistMid = distMin + (distMax - distMin) / 2.0;\n\t\t\t\tmap_p = map(p + ray_dir * distMid);\n\t\t\t\tif (abs(map_p) < MIN_RAYMARCH_DELTA) return distMid;\n\t\t\t\tif (map_p > 0.0) {\n\t\t\t\t\tdistMin = distMid + map_p;\n\t\t\t\t} else {\n\t\t\t\t\tdistMax = distMid + map_p;\n\t\t\t\t}\n\t\t\t}\n\t\t\treturn distMid;\n\t\t}\n\t}\n\treturn distMin;\n}\n\nvoid main( void ) {\n\tfloat waveHeight = USE_MOUSE ? mouse.x * 5.0 : cos(time * 0.03) * 1.2 + 1.6;\n\twaveHeight1 *= waveHeight;\n\twaveHeight2 *= waveHeight;\n\twaveHeight3 *= waveHeight;\n\t\n\tvec2 position = vec2((gl_FragCoord.x - resolution.x / 2.0) / resolution.y, (gl_FragCoord.y - resolution.y / 2.0) / resolution.y);\n\tvec3 ray_start = vec3(0, 0.2, -2);\n\tvec3 ray_dir = normalize(vec3(position,0) - ray_start);\n\tray_start.y = cos(time * 0.5) * 0.2 - 0.25 + sin(time * 2.0) * 0.05;\n\t\n\tconst float dayspeed = 0.04;\n\tfloat subtime = max(-0.16, sin(time * dayspeed) * 0.2);\n\tfloat middayperc = USE_MOUSE ? mouse.y * 0.3 - 0.15 : max(0.0, sin(subtime));\n\tvec3 light1_pos = vec3(0.0, middayperc * 200.0, USE_MOUSE ? 200.0 : cos(subtime * dayspeed) * 200.0);\n\tfloat sunperc = pow(max(0.0, min(dot(ray_dir, normalize(light1_pos)), 1.0)), 190.0 + max(0.0,light1_pos.y * 4.3));\n\tvec3 suncolor = (1.0 - max(0.0, middayperc)) * vec3(1.5, 1.2, middayperc + 0.5) + max(0.0, middayperc) * vec3(1.0, 1.0, 1.0) * 4.0;\n\t\n\tfloat height_factor = pow( 1.0 - ( ray_dir.y ) / 1.0, 6.75 );\n\tvec3 zenith_color = vec3(10.0, 10.0, 106.0)/vec3(255.0);\n\tvec3 horizon_color = vec3(79.0, 121.0, 205.0)/vec3(255.0);\n\tvec3 skycolor = mix( zenith_color, horizon_color, clamp( height_factor, 0.0, 1.0 ) );\n\t\n\t//vec3 skycolor = vec3(middayperc + 0.8, middayperc + 0.7, middayperc + 0.5);\n\tvec3 skycolor_now = suncolor * sunperc + (skycolor * (middayperc * 1.6 + 0.5)) * (1.0 - sunperc);\n\tvec4 color; \n\tfloat map_p;\n\tint iterations;\n\tfloat dist = intersect(ray_start, ray_dir, map_p, iterations);\n\tif (dist > 0.0) {\n\t\tvec3 p = ray_start + ray_dir * dist;\n\t\tvec3 light1_dir = normalize(light1_pos - p);\n        \tvec3 n = gradientNormalFast(p, map_p);\n\t\tvec3 ambient = skycolor_now * 0.1;\n        \tvec3 diffuse1 = vec3(1.1, 1.1, 0.6) * max(0.0, dot(light1_dir, n)  * 2.8);\n\t\tvec3 r = reflect(light1_dir, n);\n\t\tvec3 specular1 = vec3(1.5, 1.2, 0.6) * (0.8 * pow(max(0.0, dot(r, ray_dir)), 200.0));\t    \n\t\tfloat fog = min(max(p.z * 0.07, 0.0), 1.0);\n        \tcolor.rgb = (vec3(0.6,0.6,1.0) * diffuse1*skycolor_now + specular1 + ambient)  * (1.0 - fog) + skycolor_now * fog;\n    \t} else {\n        \tcolor.rgb = skycolor_now.rgb;\n    \t}\n\tgl_FragColor = vec4(color.rgb, 1.0);\n}",
		"/* lame-ass tunnel by kusma */\n\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\nvec2 R = resolution;\nvec2 Offset;\nvec2 Scale=vec2(0.002,0.001)\n\t;\nfloat Saturation = 0.18; // 1 - 2;\n\n\nvec3 lungth(vec2 x,vec3 c){\n\t//return vec3(0.1, 1.0, 1.0);\n       return vec3(length(x+c.r),length(x+c.g),length(x+c.b));\n}\n\nvoid main( void ) {\n\t\n\tvec2 position = (gl_FragCoord.xy - resolution * 0.5) / resolution.yy;\n\tfloat th = atan(position.y, position.x) / (2.0 * 3.1415926);\n\tfloat dd = length(position) + 0.105;\n\tfloat d = 0.5 / dd + time*0.3;\n\t\n    \tvec2 x = gl_FragCoord.xy;\n    \tvec3 c2=vec3(0.1,0,0);\n   \tx=x*Scale*R/R.x;\n    \tx+=sin(x.yx*(vec2(13,9)))/1.;\n    \tc2=lungth(sin(x*sqrt(vec2(33,43))),vec3(5,6,7)*Saturation * d);\n\tx+=sin(x.yx*sqrt(vec2(73,53)))/5.;\n    \tc2=2.*lungth(sin(time+x*sqrt(vec2(33.,23.))),c2/9.);\n    \tx+=sin(x.yx*sqrt(vec2(193,73)))/2.;\n    \tc2=lungth(sin(x*sqrt(vec2(13.,1.))),c2/2.0);\n    \tc2=.5+.5*sin(c2*8.);\n\t\n\tvec3 uv = vec3(th + d, th - d, th + sin(d) * 0.45);\n\tfloat a = 0.5 + cos(uv.x * 3.1415926 * 2.0) * 0.5;\n\tfloat b = 0.5 + cos(uv.y * 3.1415926 * 2.0) * 0.5;\n\tfloat c = 0.5 + cos(uv.z * 3.1415926 * 6.0) * 0.5;\n\tvec3 color = \tmix(vec3(0.1, 0.3, 0.5), \tvec3(0.1, 0.1, 0.2),  pow(a, 0.2)) * 3.;\n\tcolor += \tmix(vec3(0.8, 0.2, 1.0), \tvec3(0.1, 0.1, 0.2),  pow(b, 0.1)) * 0.75;\n\tcolor += \tmix(c2, \t\t\tvec3(0.1, 0.2, 0.2),  pow(c, 0.1)) * 0.75;\n\n\tgl_FragColor = vec4( (color * dd), 1.0);\n}",
		"// By @paulofalcao\n//\n// Some blobs modifications with symmetries\n\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\n//.h\nvec3 sim(vec3 p,float s);\nvec2 rot(vec2 p,float r);\nvec2 rotsim(vec2 p,float s);\n\n//nice stuff :)\nvec2 makeSymmetry(vec2 p){\n   vec2 ret=p;\n   ret=rotsim(ret,sin(time*0.3)*2.0+3.0);\n   ret.x=abs(ret.x);\n   return ret;\n}\n\nfloat makePoint(float x,float y,float fx,float fy,float sx,float sy,float t){\n   float xx=x+tan(t*fx)*sx;\n   float yy=y-tan(t*fy)*sy;\n   return 0.8/sqrt(abs(x*xx+yy*yy));\n}\n\n\n\n//util functions\nconst float PI=3.14159265;\n\nvec3 sim(vec3 p,float s){\n   vec3 ret=p;\n   ret=p+s/2.0;\n   ret=fract(ret/s)*s-s/2.0;\n   return ret;\n}\n\nvec2 rot(vec2 p,float r){\n   vec2 ret;\n   ret.x=p.x*cos(r)-p.y*sin(r);\n   ret.y=p.x*sin(r)+p.y*cos(r);\n   return ret;\n}\n\nvec2 rotsim(vec2 p,float s){\n   vec2 ret=p;\n   ret=rot(p,-PI/(s*2.0));\n   ret=rot(p,floor(atan(ret.x,ret.y)/PI*s)*(PI/s));\n   return ret;\n}\n//Util stuff end\n\nvoid main( void ) {\n\n   vec2 p=(gl_FragCoord.xy/resolution.x)*2.0-vec2(1.0,resolution.y/resolution.x);\n\n   p=p*2.0;\n  \n   p=makeSymmetry(p);\n   \n   float x=p.x;\n   float y=p.y;\n   \n   float t=time*0.5;\n\n   float a=\n       makePoint(x,y,3.3,2.9,0.3,0.3,t);\n   a=a+makePoint(x,y,1.9,2.0,0.4,0.4,t);\n   a=a+makePoint(x,y,0.8,0.7,0.4,0.5,t);\n   a=a+makePoint(x,y,2.3,0.1,0.6,0.3,t);\n   a=a+makePoint(x,y,0.8,1.7,0.5,0.4,t);\n   a=a+makePoint(x,y,0.3,1.0,0.4,0.4,t);\n   a=a+makePoint(x,y,1.4,1.7,0.4,0.5,t);\n   a=a+makePoint(x,y,1.3,2.1,0.6,0.3,t);\n   a=a+makePoint(x,y,1.8,1.7,0.5,0.4,t);   \n   \n   float b=\n       makePoint(x,y,1.2,1.9,0.3,0.3,t);\n   b=b+makePoint(x,y,0.7,2.7,0.4,0.4,t);\n   b=b+makePoint(x,y,1.4,0.6,0.4,0.5,t);\n   b=b+makePoint(x,y,2.6,0.4,0.6,0.3,t);\n   b=b+makePoint(x,y,0.7,1.4,0.5,0.4,t);\n   b=b+makePoint(x,y,0.7,1.7,0.4,0.4,t);\n   b=b+makePoint(x,y,0.8,0.5,0.4,0.5,t);\n   b=b+makePoint(x,y,1.4,0.9,0.6,0.3,t);\n   b=b+makePoint(x,y,0.7,1.3,0.5,0.4,t);\n\n   float c=\n       makePoint(x,y,3.7,0.3,0.3,0.3,t);\n   c=c+makePoint(x,y,1.9,1.3,0.4,0.4,t);\n   c=c+makePoint(x,y,0.8,0.9,0.4,0.5,t);\n   c=c+makePoint(x,y,1.2,1.7,0.6,0.3,t);\n   c=c+makePoint(x,y,0.3,0.6,0.5,0.4,t);\n   c=c+makePoint(x,y,0.3,0.3,0.4,0.4,t);\n   c=c+makePoint(x,y,1.4,0.8,0.4,0.5,t);\n   c=c+makePoint(x,y,0.2,0.6,0.6,0.3,t);\n   c=c+makePoint(x,y,1.3,0.5,0.5,0.4,t);\n   \n   vec3 d=vec3(a,b,c)/31.0;\n   \n   gl_FragColor = vec4(d.x,d.y,d.z,1.0);\n}",
		"// By @paulofalcao\n//\n// Merry Christmas! :)\n//\n//\n// Some GLSL compilers/drivers can't optimize the exit from the loop on break\n// and always run all iterations.\n//\n// Works very nice on my MacBook Pro with NVIDIA 320M on MacOSX 10.7 / Chrome\n// But runs very very slow on a Macbook Pro NVIDIA 320M on Win7 / Chrome\n\n#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform float time;\n\n//Util Start\n\nfloat PI=3.14159265;\n\nvec2 ObjUnion(vec2 obj0,vec2 obj1){\n  if (obj0.x<obj1.x)\n    return obj0;\n  else\n    return obj1;\n}\n\nvec3 sim(vec3 p,float s){\n   vec3 ret=p;\n   ret=p+s/2.0;\n   ret=fract(ret/s)*s-s/2.0;\n   return ret;\n}\n\nvec2 rot(vec2 p,float r){\n   vec2 ret;\n   ret.x=p.x*cos(r)-p.y*sin(r);\n   ret.y=p.x*sin(r)+p.y*cos(r);\n   return ret;\n}\n\nvec2 rotsim(vec2 p,float s){\n   vec2 ret=p;\n   ret=rot(p,-PI/(s*2.0));\n   ret=rot(p,floor(atan(ret.x,ret.y)/PI*s)*(PI/s));\n   return ret;\n}\n\nfloat rnd(vec2 v){\n  return sin((sin(((v.y-1453.0)/(v.x+1229.0))*23232.124))*16283.223)*0.5+0.5; \n}\n\nfloat noise(vec2 v){\n  vec2 v1=floor(v);\n  vec2 v2=smoothstep(0.0,1.0,fract(v));\n  float n00=rnd(v1);\n  float n01=rnd(v1+vec2(0,1));\n  float n10=rnd(v1+vec2(1,0));\n  float n11=rnd(v1+vec2(1,1));\n  return mix(mix(n00,n01,v2.y),mix(n10,n11,v2.y),v2.x);\n}\n\n//Util End\n\n \n//Scene Start\n \n//Floor\nvec2 obj0(in vec3 p){\n  if (p.y<0.4)\n  p.y+=sin(p.x)*0.4*cos(p.z)*0.4;\n  return vec2(p.y,0);\n}\n\nvec3 obj0_c(vec3 p){\n  float f=\n    noise(p.xz)*0.5+\n    noise(p.xz*2.0+13.45)*0.25+\n    noise(p.xz*4.0+23.45)*0.15;\n  float pc=min(max(1.0/length(p.xz),0.0),1.0)*0.5;\n  return vec3(f)*0.3+pc+0.5;\n}\n\n//Snow\nfloat makeshowflake(vec3 p){\n  return length(p)-0.03;\n}\n\nfloat makeShow(vec3 p,float tx,float ty,float tz){\n  p.y=p.y+time*tx;\n  p.x=p.x+time*ty;\n  p.z=p.z+time*tz;\n  p=sim(p,4.0);\n  return makeshowflake(p);\n}\n\nvec2 obj1(vec3 p){\n  float f=makeShow(p,1.11, 1.03, 1.38);\n  f=min(f,makeShow(p,1.72, 0.74, 1.06));\n  f=min(f,makeShow(p,1.93, 0.75, 1.35));\n  f=min(f,makeShow(p,1.54, 0.94, 1.72));\n  f=min(f,makeShow(p,1.35, 1.33, 1.13));\n  f=min(f,makeShow(p,1.55, 0.23, 1.16));\n  f=min(f,makeShow(p,1.25, 0.41, 1.04));\n  f=min(f,makeShow(p,1.49, 0.29, 1.31));\n  f=min(f,makeShow(p,1.31, 1.31, 1.13));  \n  return vec2(f,1.0);\n}\n \nvec3 obj1_c(vec3 p){\n    return vec3(1,1,1);\n}\n\n\n//Star\nvec2 obj2(vec3 p){\n  p.y=p.y-4.3;\n  p=p*4.0;\n  float l=length(p);\n  if (l<2.0){\n  p.xy=rotsim(p.xy,2.5);\n  p.y=p.y-2.0; \n  p.z=abs(p.z);\n  p.x=abs(p.x);\n  return vec2(dot(p,normalize(vec3(2.0,1,3.0)))/4.0,2);\n  } else return vec2((l-1.9)/4.0,2.0);\n}\n\nvec3 obj2_c(vec3 p){\n  return vec3(1.0,0.5,0.2);\n}\n \n//Objects union\nvec2 inObj(vec3 p){\n  return ObjUnion(ObjUnion(obj0(p),obj1(p)),obj2(p));\n}\n \n//Scene End\n \nvoid main(void){\n  vec2 vPos=-1.0+2.0*gl_FragCoord.xy/resolution.xy;\n \n  //Camera animation\n  vec3 vuv=normalize(vec3(sin(time)*0.3,1,0));\n  vec3 vrp=vec3(0,cos(time*0.5)+2.5,0);\n  vec3 prp=vec3(sin(time*0.5)*(sin(time*0.39)*2.0+3.5),sin(time*0.5)+3.5,cos(time*0.5)*(cos(time*0.45)*2.0+3.5));\n  float vpd=1.5;  \n \n  //Camera setup\n  vec3 vpn=normalize(vrp-prp);\n  vec3 u=normalize(cross(vuv,vpn));\n  vec3 v=cross(vpn,u);\n  vec3 scrCoord=prp+vpn*vpd+vPos.x*u*resolution.x/resolution.y+vPos.y*v;\n  vec3 scp=normalize(scrCoord-prp);\n \n  //lights are 2d, no raymarching\n  mat4 cm=mat4(\n    u.x,   u.y,   u.z,   -dot(u,prp),\n    v.x,   v.y,   v.z,   -dot(v,prp),\n    vpn.x, vpn.y, vpn.z, -dot(vpn,prp),\n    0.0,   0.0,   0.0,   1.0);\n \n  vec4 pc=vec4(0,0,0,0);\n  const float maxl=40.0;\n  for(float i=0.0;i<maxl;i++){\n  vec4 pt=vec4(\n    sin(i*PI*2.0*7.0/maxl)*2.0*(1.0-i/maxl),\n    i/maxl*4.0,\n    cos(i*PI*2.0*7.0/maxl)*2.0*(1.0-i/maxl),\n    1.0);\n  pt=pt*cm;\n  vec2 xy=(pt/(-pt.z/vpd)).xy+vPos*vec2(resolution.x/resolution.y,1.0);\n  float c;\n  c=0.4/length(xy);\n  pc+=vec4(\n          (sin(i*5.0+time*10.0)*0.5+0.5)*c,\n          (cos(i*3.0+time*8.0)*0.5+0.5)*c,\n          (sin(i*6.0+time*9.0)*0.5+0.5)*c,0.0);\n  }\n  pc=pc/maxl;\n\n  pc=smoothstep(0.0,1.0,pc);\n  \n  //Raymarching\n  const vec3 e=vec3(0.1,0,0);\n  const float maxd=15.0; //Max depth\n \n  vec2 s=vec2(0.1,0.0);\n  vec3 c,p,n;\n \n  float f=1.0;\n  for(int i=0;i<64;i++){\n    if (abs(s.x)<.001||f>maxd) break;\n    f+=s.x;\n    p=prp+scp*f;\n    s=inObj(p);\n  }\n  \n  if (f<maxd){\n    if (s.y==0.0)\n      c=obj0_c(p);\n    else if (s.y==1.0)\n      c=obj1_c(p);\n    else\n      c=obj2_c(p);\n      if (s.y<=1.0){\n        gl_FragColor=vec4(c*max(1.0-f*.08,0.0),1.0)+pc;\n      } else{\n         //tetrahedron normal   \n         const float n_er=0.01;\n         float v1=inObj(vec3(p.x+n_er,p.y-n_er,p.z-n_er)).x;\n         float v2=inObj(vec3(p.x-n_er,p.y-n_er,p.z+n_er)).x;\n         float v3=inObj(vec3(p.x-n_er,p.y+n_er,p.z-n_er)).x;\n         float v4=inObj(vec3(p.x+n_er,p.y+n_er,p.z+n_er)).x;\n         n=normalize(vec3(v4+v1-v3-v2,v3+v4-v1-v2,v2+v4-v3-v1));\n  \n        float b=max(dot(n,normalize(prp-p)),0.0);\n        gl_FragColor=vec4((b*c+pow(b,8.0))*(1.0-f*.01),1.0)+pc;\n      }\n  }\n  else gl_FragColor=vec4(0,0,0,0)+pc; //background color\n}",
		"// // // // // // // // \n// // BY PICCOLA ELE\n// // // // // // // // \n\n\n\n\n#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\nfloat makePoint(float x,float y,float fx,float fy,float sx,float sy,float t){\n   float xx=x+tan(t*fx)*sx;\n   float yy=y+tan(t*fy)*sy;\n   return 0.30/sqrt(abs(x*xx+y*yy));\n}\n\nvoid main( void ) {\n\n   vec2 p=(gl_FragCoord.xy/resolution.x)*2.0-vec2(3.50,resolution.y/resolution.x);\n  \n   float t = time / 10.0;\n\n   p=p*0.10;\n   \n   float x=p.x;\n   float y=p.y;\n\n   float a=\n       makePoint(x,y,3.3,2.1,0.3,0.3,t);\n   a=a+makePoint(x,y,1.9,2.0,0.4,0.4,t);\n   a=a+makePoint(x,y,0.8,0.7,0.4,0.5,t);\n   a=a+makePoint(x,y,2.3,0.1,0.6,0.3,t);\n   a=a+makePoint(x,y,0.8,1.7,0.5,0.4,t);\n   a=a+makePoint(x,y,0.3,1.0,0.4,0.4,t);\n   a=a+makePoint(x,y,1.4,1.7,0.4,0.5,t);\n   a=a+makePoint(x,y,1.3,2.1,0.6,0.3,t);\n   a=a+makePoint(x,y,1.8,1.7,0.5,0.4,t);   \n   \n   float b=\n       makePoint(x,y,1.2,1.9,0.3,0.3,t);\n   b=b+makePoint(x,y,0.7,2.7,0.4,0.4,t);\n   b=b+makePoint(x,y,1.4,0.6,0.4,0.5,t);\n   b=b+makePoint(x,y,2.6,0.4,0.6,0.3,t);\n   b=b+makePoint(x,y,0.7,1.4,0.5,0.4,t);\n   b=b+makePoint(x,y,0.7,1.7,0.4,0.4,t);\n   b=b+makePoint(x,y,0.8,0.5,0.4,0.5,t);\n   b=b+makePoint(x,y,1.4,0.9,0.6,0.3,t);\n   b=b+makePoint(x,y,0.7,1.3,0.5,0.4,t);\n\n   float c=\n       makePoint(x,y,3.7,0.3,0.3,0.3,t);\n   c=c+makePoint(x,y,1.9,1.3,0.4,0.4,t);\n   c=c+makePoint(x,y,0.8,0.9,0.4,0.5,t);\n   c=c+makePoint(x,y,1.2,1.7,0.6,0.3,t);\n   c=c+makePoint(x,y,0.3,0.6,0.5,0.4,t);\n   c=c+makePoint(x,y,0.3,0.3,0.4,0.4,t);\n   c=c+makePoint(x,y,1.4,0.8,0.4,0.5,t);\n   c=c+makePoint(x,y,0.2,0.6,0.6,0.3,t);\n   c=c+makePoint(x,y,1.3,0.5,0.5,0.4,t);\n   \n  float D=\n       makePoint(x,y,3.7,0.3,0.3,0.3,t);\n   D=c+makePoint(x,y,1.9,1.3,0.4,0.4,t);\n   D=c+makePoint(x,y,0.8,0.9,0.4,0.5,t);\n   D=c+makePoint(x,y,1.2,1.7,0.6,0.3,t);\n   D=c+makePoint(x,y,0.3,0.6,0.5,0.4,t);\n   D=c+makePoint(x,y,0.3,0.3,0.4,0.4,t);\n   D=c+makePoint(x,y,1.4,0.8,0.4,0.5,t);\n   D=c+makePoint(x,y,0.2,0.6,0.6,0.3,t);\n   D=c+makePoint(x,y,1.3,0.5,0.5,0.4,t);\n  \n  float e=\n       makePoint(x,y,1.7,0.3,0.3,0.3,t);\n   e=c+makePoint(x,y,4.9,1.3,0.4,0.4,t);\n   e=c+makePoint(x,y,0.8,10.9,0.4,0.5,t);\n   e=c+makePoint(x,y,11.2,1.7,0.6,0.3,t);\n   e=c+makePoint(x,y,0.3,0.6,0.5,0.4,t);\n   e=c+makePoint(x,y,10.3,0.3,0.4,0.4,t);\n   e=c+makePoint(x,y,1.4,0.8,0.3,3.5,t);\n   e=c+makePoint(x,y,0.2,0.6,0.6,4.3,t);\n   e=c+makePoint(x,y,1.3,10.5,9.5,4.4,t);\n   \n\n   \n\n   vec3 d=vec3(a,b,c)/32.0;\n   \n   gl_FragColor = vec4(d.x,d.y,d.z,1.0);\n}"
	);
	
	this.load_random_shader = function() {
		$i = Math.round(Math.random() * this.activeShaders.length -1);
		if ($i > this.activeShaders.length - 1){
			$i = this.activeShaders.length -1;
		}
		if ($i < 0){
			$i = 0;
		}
		this.load_shader_from_lib($i);
	}
	
	this.load_shader_from_lib = function($indice) {
		$codigo = this.activeShaders[$indice];
		this.load_shader($codigo);
	}
	
	this.load_shader = function($codigo){
		this.resetSurface();
		this.compile($codigo);
	}
	
	this.init = function() {
		if (!document.addEventListener) {
			//Browser viejo o mala implementación de JS. 
			console.error("No se encontró document.addEvenListener");
			return;
		}
		
		if ( !this.lContext ) {
			console.warning("No hay contexto WebGL inicializado").
			return;
		} else {
			// Create vertex buffer (2 triangles)
			this.buffer = this.lContext.createBuffer();
			this.lContext.bindBuffer( this.lContext.ARRAY_BUFFER, this.buffer );
			this.lContext.bufferData( this.lContext.ARRAY_BUFFER, new Float32Array( [ - 1.0, - 1.0, 1.0, - 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0 ] ), this.lContext.STATIC_DRAW );
			// Create surface buffer (coordinates at screen corners)
			this.surface.buffer = this.lContext.createBuffer();
		}
		
		this.onWindowResize();
		window.addEventListener( 'resize', this.onWindowResize, false );
		this.load_random_shader();
		this.compileScreenProgram();
		
		this.animator.setParent(this);
		
		this.animator.addCallback( function(){this.parent.update();this.parent.render();}, null, false );
		this.handle_events("on_ready");
		this.animator.start();
		
	}
	
	this.computeSurfaceCorners = function() {
		if (this.lContext) {
			this.surface.width = this.surface.height * this.parameters.screenWidth / this.parameters.screenHeight;
			
			var halfWidth = this.surface.width * 0.5, halfHeight = this.surface.height * 0.5;
			
			this.lContext.bindBuffer( this.lContext.ARRAY_BUFFER, this.surface.buffer );
			this.lContext.bufferData( 
				this.lContext.ARRAY_BUFFER, new Float32Array( [
				this.surface.centerX - halfWidth, this.surface.centerY - halfHeight,
				this.surface.centerX + halfWidth, this.surface.centerY - halfHeight,
				this.surface.centerX - halfWidth, this.surface.centerY + halfHeight,
				this.surface.centerX + halfWidth, this.surface.centerY - halfHeight,
				this.surface.centerX + halfWidth, this.surface.centerY + halfHeight,
				this.surface.centerX - halfWidth, this.surface.centerY + halfHeight ] ), 
				this.lContext.STATIC_DRAW 
			);
		}
	}
	
	this.resetSurface = function() {
		this.surface.centerX = this.surface.centerY = 0;
		this.surface.height = 1;
		this.computeSurfaceCorners();
	}
	
	this.compile = function($codigo) {
		if (!this.lContext) {
			return;
		}
		var program = this.lContext.createProgram();
		var fragment = $codigo;
		var vertex = this.surfaceVertexShader;
		
		var vs = this.createShader( vertex, this.lContext.VERTEX_SHADER );
		var fs = this.createShader( fragment, this.lContext.FRAGMENT_SHADER );
		
		if ( vs == null || fs == null ) return null;
		
		this.lContext.attachShader( program, vs );
		this.lContext.attachShader( program, fs );

		this.lContext.deleteShader( vs );
		this.lContext.deleteShader( fs );
		
		this.lContext.linkProgram( program );

		if ( !this.lContext.getProgramParameter( program, this.lContext.LINK_STATUS ) ) {
			var error = this.lContext.getProgramInfoLog( program );
			console.error( error );
			console.error( 'VALIDATE_STATUS: ' + this.lContext.getProgramParameter( program, this.lContext.VALIDATE_STATUS ), 'ERROR: ' + this.lContext.getError() );
			return;
		}

		if ( this.currentProgram ) {
			this.lContext.deleteProgram( this.currentProgram );
			//setURL( fragment );
		}
		this.currentProgram = program;
		
		// Cache uniforms
		this.cacheUniformLocation( program, 'time' );
		this.cacheUniformLocation( program, 'mouse' );
		this.cacheUniformLocation( program, 'resolution' );
		this.cacheUniformLocation( program, 'backbuffer' );
		this.cacheUniformLocation( program, 'surfaceSize' );
		// Load program into GPU
		this.lContext.useProgram( this.currentProgram );
		// Set up buffers
		this.surface.positionAttribute = this.lContext.getAttribLocation(this.currentProgram, "surfacePosAttrib");
		this.lContext.enableVertexAttribArray(this.surface.positionAttribute);
		this.vertexPosition = this.lContext.getAttribLocation(this.currentProgram, "position");
		this.lContext.enableVertexAttribArray( this.vertexPosition );
	}
	
	this.compileScreenProgram = function() {
		if (!this.lContext) { return; }
		
		var program = this.lContext.createProgram();
		var fragment = this.fragmentShader;
		var vertex = this.vertexShader;

		var vs = this.createShader( vertex, this.lContext.VERTEX_SHADER );
		var fs = this.createShader( fragment, this.lContext.FRAGMENT_SHADER );

		this.lContext.attachShader( program, vs );
		this.lContext.attachShader( program, fs );
		this.lContext.deleteShader( vs );
		this.lContext.deleteShader( fs );
		this.lContext.linkProgram( program );

		if ( !this.lContext.getProgramParameter( program, this.lContext.LINK_STATUS ) ) {
			console.error( 'VALIDATE_STATUS: ' + this.lContext.getProgramParameter( program, this.lContext.VALIDATE_STATUS ), 'ERROR: ' + this.lContext.getError() );
			return;
		}

		this.screenProgram = program;
		this.lContext.useProgram( this.screenProgram );

		this.cacheUniformLocation( program, 'resolution' );
		this.cacheUniformLocation( program, 'texture' );

		this.screenVertexPosition = this.lContext.getAttribLocation(this.screenProgram, "position");
		this.lContext.enableVertexAttribArray( this.screenVertexPosition );

	}
	
	this.cacheUniformLocation = function( program, label ) {
		if ( program.uniformsCache === undefined ) {
			program.uniformsCache = {};
		}
		program.uniformsCache[ label ] = this.lContext.getUniformLocation( program, label );
	}
	
	this.createTarget = function( width, height ) {
		var target = {};
		target.framebuffer = this.lContext.createFramebuffer();
		target.renderbuffer = this.lContext.createRenderbuffer();
		target.texture = this.lContext.createTexture();
		// set up framebuffer
		this.lContext.bindTexture( this.lContext.TEXTURE_2D, target.texture );
		this.lContext.texImage2D( this.lContext.TEXTURE_2D, 0, this.lContext.RGBA, width, height, 0, this.lContext.RGBA, this.lContext.UNSIGNED_BYTE, null );
		this.lContext.texParameteri( this.lContext.TEXTURE_2D, this.lContext.TEXTURE_WRAP_S, this.lContext.CLAMP_TO_EDGE );
		this.lContext.texParameteri( this.lContext.TEXTURE_2D, this.lContext.TEXTURE_WRAP_T, this.lContext.CLAMP_TO_EDGE );
		this.lContext.texParameteri( this.lContext.TEXTURE_2D, this.lContext.TEXTURE_MAG_FILTER, this.lContext.NEAREST );
		this.lContext.texParameteri( this.lContext.TEXTURE_2D, this.lContext.TEXTURE_MIN_FILTER, this.lContext.NEAREST );
		this.lContext.bindFramebuffer( this.lContext.FRAMEBUFFER, target.framebuffer );
		this.lContext.framebufferTexture2D( this.lContext.FRAMEBUFFER, this.lContext.COLOR_ATTACHMENT0, this.lContext.TEXTURE_2D, target.texture, 0 );
		// set up renderbuffer
		this.lContext.bindRenderbuffer( this.lContext.RENDERBUFFER, target.renderbuffer );
		this.lContext.renderbufferStorage( this.lContext.RENDERBUFFER, this.lContext.DEPTH_COMPONENT16, width, height );
		this.lContext.framebufferRenderbuffer( this.lContext.FRAMEBUFFER, this.lContext.DEPTH_ATTACHMENT, this.lContext.RENDERBUFFER, target.renderbuffer );
		// clean up
		this.lContext.bindTexture( this.lContext.TEXTURE_2D, null );
		this.lContext.bindRenderbuffer( this.lContext.RENDERBUFFER, null );
		this.lContext.bindFramebuffer( this.lContext.FRAMEBUFFER, null);
		return target;
	}
	
	this.createRenderTargets = function() {
		this.frontTarget = this.createTarget( this.parameters.screenWidth, this.parameters.screenHeight );
		this.backTarget = this.createTarget( this.parameters.screenWidth, this.parameters.screenHeight );
	}
	
	this.createShader = function( src, type ) {
		var shader = this.lContext.createShader( type );
		var line, lineNum, lineError, index = 0, indexEnd;
		
		this.lContext.shaderSource( shader, src );
		this.lContext.compileShader( shader );

		if ( !this.lContext.getShaderParameter( shader, this.lContext.COMPILE_STATUS ) ) {
			console.error("Error al intentar crear el shader.");
			return null;
		}
		return shader;
	}
	
	this.onWindowResize = function ( event ) {
		var isMaxWidth = ((this.resizer.currentWidth === this.resizer.maxWidth) || (this.resizer.currentWidth === this.resizer.minWidth)),
			isMaxHeight = ((this.resizer.currentHeight === this.resizer.maxHeight) || (this.resizer.currentHeight === this.resizer.minHeight));
		this.resizer.isResizing = false;
		this.resizer.maxWidth = window.innerWidth - 75;
		this.resizer.maxHeight = window.innerHeight - 125;
		if (isMaxWidth || (this.resizer.currentWidth > this.resizer.maxWidth)) {
			this.resizer.currentWidth = this.resizer.maxWidth;
		}
		if (isMaxHeight || (this.resizer.currentHeight > this.resizer.maxHeight)) {
			this.resizer.currentHeight = this.resizer.maxHeight;
		}
		if (this.resizer.currentWidth < this.resizer.minWidth) { this.resizer.currentWidth = this.resizer.minWidth; }
		if (this.resizer.currentHeight < this.resizer.minHeight) { this.resizer.currentHeight = this.resizer.minHeight; }

		this.context.canvas.width = window.innerWidth;
		this.context.canvas.height = window.innerHeight;

		this.lContext.canvas.width = window.innerWidth / this.quality;
		this.lContext.canvas.height = window.innerHeight / this.quality;
		
		this.context.canvas.style.width = window.innerWidth + 'px';
		this.context.canvas.style.height = window.innerHeight + 'px';
		this.lContext.canvas.style.width = window.innerWidth + 'px';
		this.lContext.canvas.style.height = window.innerHeight + 'px';

		this.parameters.screenWidth = this.lContext.canvas.width;
		this.parameters.screenHeight = this.lContext.canvas.height;
		this.computeSurfaceCorners();
		if (this.lContext) {
			this.lContext.viewport( 0, 0, this.lContext.canvas.width, this.lContext.canvas.height );
			this.createRenderTargets();
		}
	}
	
}

