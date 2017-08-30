import _ from 'lodash';
// import printMe from './print.js';
import './style.css';
import './style1.css'
// import Icon from './bg.png';
import React from 'react';
import { Link } from 'react-redux'

function component() {
  var element = document.createElement('div');
  var btn = document.createElement('button');

  // Lodash（目前通过一个 script 脚本引入）对于执行这一行是必需的
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
   element.className = 'nav name'

   element.appendChild(btn);
   btn.innerHTML = 'Click me and check the console!';

   /**
    * 按需加载 print.js
    */
   btn.onclick = function(e) {
     import(/* webpackChunkName: "print" */ './print').then(function(module) {
     var print = module.default;

     print();
   });
  }


  return element;
}

document.body.appendChild(component());