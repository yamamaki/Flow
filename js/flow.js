/**
* global variables ;
**/
var per_x = undefined;
var per_y = undefined;
var bp = [];
var ep_pair = [];
var background = "#065688";
var dir = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
var default_settings = {
    "width": undefined,
    "height": undefined,
    "num_of_row": 2,
    "num_of_col": 2,
    "num_of_line": 2,
    "max_vv": 1,
    "max_vc": 1,
    "max_z": 100,
}

function Flow(canvas) {
    return {
        init: function (settings) {
            $.extend(default_settings, settings);
            default_settings.width = canvas.width;
            default_settings.height = canvas.height;
            width = canvas.width;
            height = canvas.height;
            per_x = width/default_settings.num_of_row;
            per_y = height/default_settings.num_of_col;
            num_of_row = default_settings.num_of_row;
            num_of_col = default_settings.num_of_col;
            num_of_line = default_settings.num_of_line;
            bp = get_bp_matrix(num_of_row, num_of_col);
            ep_pair = get_endpoint_pair(num_of_row, num_of_col); 
            return 0;
        },
        run: function () {
            window.requestAnimFrame = function(){
                return (
                    window.requestAnimationFrame       || 
                    window.webkitRequestAnimationFrame || 
                    window.mozRequestAnimationFrame    || 
                    window.oRequestAnimationFrame      || 
                    window.msRequestAnimationFrame     || 
                    function(callback){
                        window.setTimeout(callback, 1000 / 60);
                    });
            }();
            var ctx = canvas.getContext("2d");
            (function demo() {
                draw(ctx, default_settings.width, default_settings.height);
                requestAnimFrame(demo);
            }) ();
        },
        destroy: function () {
            ep_pair = [];
            bp = [];
        },
        helloworld: function () {
            return "helloworld"
        }
    }
}
/**
* generate basis points matrix ;
**/
function get_bp_matrix(m, n) {
    var ret = [];
    var ret_ = [];
    for (var i=0; i<m; ++i) {
        for (var j=0; j<n; ++j) {
            ret_.push(new Basispoint(i, j));
        }
        ret.push(ret_);
        ret_  = [];
    }
    return ret;
}
/**
* return a random number from [offset, max-1+offset] ;
**/
function rrandom(max_, offset) {
    offset = offset || 0;
    return Math.floor(Math.random()*max_+offset);
}

/** 
* define basis point object ;
**/
function Basispoint(row, col) {
    this.pos = [row, col];
    this.x = rrandom(per_x, row*per_x);
    this.y = rrandom(per_y, col*per_y);
    this.z = rrandom(default_settings.max_z); // the darkness or lightness of the color depends on the value of z-dimension ;
    this.is_ep = false; // whether on the line or not ;
    this.vv = default_settings.max_vv*(Math.random()*2-1); // vv: velocity vector ;
    this.vc = default_settings.max_vc*(Math.random()*2-1); // vc: velocity for color changes ;
}

/**
* return the postions of matrix elements in a random order ;
**/
function position_in_random(row, col) {
    var a = [];
    var b = [];
    for (var i=0; i<row; ++i) {
        for (var j=0; j<col; ++j) {
            a.push(i*col+j);
        }
    }
    for (var k=0; k<row*col; ++k) {
        rand = rrandom(row*col);
        tmp = a[k];
        a[k] = a[rand];
        a[rand] = tmp;
    }
    for (k=0; k<row*col; ++k) {
        b.push([Math.floor(a[k]/col), a[k]%col]);
    }
    return b;
}
/**
* return #num_of_line pairs of end points ;
**/
function get_endpoint_pair(row, col) {
    pos_in_rand = position_in_random(row, col);
    for (var i=0; i<row*col; ++i) {
        if (ep_pair.length == num_of_line) {
            return ep_pair;
        }
        ep = bp[pos_in_rand[i][0]][pos_in_rand[i][1]];
        ep_dir = position_in_random(8,1);
        for (var j=0; j<8 && !ep.is_ep; ++j) {
            step = dir[ep_dir[j][0]];
            next_ep_row = ep.pos[0]+step[0];
            next_ep_col = ep.pos[1]+step[1]; 
            if (next_ep_row > row-1 || next_ep_row < 0 || next_ep_col > col-1 || next_ep_col < 0) {
                continue;
            }
            next_ep = bp[next_ep_row][next_ep_col];
            if (next_ep.is_ep == true) {
                continue;
            }
            next_ep.is_ep = true;
            ep.is_ep = true;
            ep_pair.push([ep.pos, next_ep.pos]);
            break;
        }
    }
}
  
/** 
* simulate basis points moving on the lines ;
**/
function movement(ep_pair) {
    var ep, ep_;
    for (var i=0; i<ep_pair.length; ++i) {
        ep = getPointByPos(ep_pair[i][0]);
        ep_ = getPointByPos(ep_pair[i][1]);
        ang = Math.atan((ep.y-ep_.y)/(ep.x-ep_.x));
        recTrace(ep, ang);
        recTrace(ep_, ang);
    }
}

function getPointByPos(pos) {
    return bp[pos[0]][pos[1]];
}

function recTrace(ep, ang) {
    per_x = default_settings.width/default_settings.num_of_col;
    per_y = default_settings.height/default_settings.num_of_row;
    max_x = (ep.pos[1]+1)*per_x;
    min_x = ep.pos[1]*per_x;
    max_y = (ep.pos[0]+1)*per_y; 
    min_y = ep.pos[0]*per_y;
    ep.x += ep.vv*Math.cos(ang);
    ep.y += ep.vv*Math.sin(ang);
    ep.z += ep.vc;
    if ((ep.x-max_x)*(ep.x-min_x) >= 0 || (ep.y-max_y)*(ep.y-min_y) >= 0) {
        ep.x -= 2*ep.vv*Math.cos(ang);
        ep.y -= 2*ep.vv*Math.sin(ang);
        ep.z -= 2*ep.vc;
        ep.vv *= -1;
        ep.vc *= -1;
    }
}

function draw(ctx, w, h) {
    num_of_row = default_settings.num_of_row;
    num_of_col = default_settings.num_of_col;
    ctx.clearRect(0,0,w,h);
    movement(ep_pair);
    for (var i=0; i<num_of_row-1; ++i) {
        for (var j=0; j<num_of_col-1; ++j) {
            ctx.fillStyle = background;
            ctx.beginPath();
            ctx.moveTo(bp[i][j].x, bp[i][j].y);
            ctx.lineTo(bp[i][j+1].x, bp[i][j+1].y);
            ctx.lineTo(bp[i+1][j+1].x, bp[i+1][j+1].y);
            ctx.closePath();
            ctx.fill()

            ctx.fillStyle = background;
            ctx.beginPath();
            ctx.moveTo(bp[i][j].x, bp[i][j].y);
            ctx.lineTo(bp[i+1][j].x, bp[i+1][j].y);
            ctx.lineTo(bp[i+1][j+1].x, bp[i+1][j+1].y);
            ctx.closePath();
            ctx.fill();
        }
    }


}
