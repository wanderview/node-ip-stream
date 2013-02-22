// Copyright (c) 2013, Benjamin J. Kelly ("Author")
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'use strict';

module.exports = IpStream;

var IpHeader = require('ip-header');
var Transform = require('stream').Transform;
if (!Transform) {
  Transform = require('readable-stream/transform');
}
var util = require('util');

util.inherits(IpStream, Transform);

function IpStream(opts) {
  var self = (this instanceof IpStream)
           ? this
           : Object.create(IpStream.prototype);

  opts = opts || {};

  if (opts.objectMode === false) {
    throw new Error('IpStream requires objectMode; do not set ' +
                    'option {objectMode: false}');
  }
  opts.objectMode = true;

  Transform.call(self, opts);

  return self;
}

IpStream.prototype._transform = function(msg, output, callback) {
  var data = (msg instanceof Buffer) ? msg : msg.data;
  var type = msg.ether ? msg.ether.type : 'ip';

  if (type !== 'ip') {
    this.emit('ignored', msg);
    callback();
    return;
  }

  try {
    var iph = new IpHeader(msg.data);

    // TODO: handle fragmentation

    msg.ip = iph;
    msg.data = msg.data.slice(iph.length);
    output(msg);

  } catch (error) {
    this.emit('ignored', msg);
  }

  callback();
}