/**
* global variables ;
**/
var per_x = undefined;
var per_y = undefined;
var bp = [];
var ep_pair = [];
var dir = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
var default_settings = {
    "width": undefined,
    "height": undefined,
    "num_of_row": 3,
    "num_of_col": 4,
    "num_of_line": 4,
    "max_vv": 5,
    "max_vc": 5,
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


        }
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
    this.vv = rrandom(default_settings.max_vv); // vv: velocity vector ;
    this.vc = rrandom(default_settings.max_vc); // vc: velocity for color changes ;
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
            console.log("ep", ep.pos);
            console.log("next_ep", next_ep.pos);
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
        epx = ep.x+ep.vv*Math.cos(ang);
        epy = ep.y+ep.vv*Math.sin(ang);
        epz = ep.z+ep.vc;
        ep_x = ep_.x+ep_.vv*Math.cos(ang);
        ep_y = ep_.y+ep_.vv*Math.sin(ang);
        ep_z = ep_.z+ep_.vc;
        ep = recTrace(ep, epx, epy);
        ep_ = recTrace(ep_, ep_x, ep_y);
     
    }
}

function getPointByPos(pos) {
    return bp[pos[0]][pos[1]];
}

function recTrace(ep, epx, epy) {
    per_x = default_setttings.width/default_settings.num_of_col;
    per_y = default_setttings.height/default_setttings.num_of_row;
    delta_x = epx-ep.x;
    delta_y = epy-ep.y;
    max_x = (ep.pos[1]+1)*per_x;
    min_x = ep.pos[1]*per_x;
    max_y = (ep.pos[0]+1)*per_y; 
    min_y = ep.pos[0]*per_y
    if ((ep.x-max_x)*(ep.x-min_x) >= 0 || (ep.y-max_y)*(ep.y-min_y)) {
        n.vv *= -1;
        n.vc *= -1;
        ep.x -= delta_x;
        ep.y -= delta_y;
    }
    return ep;
}

