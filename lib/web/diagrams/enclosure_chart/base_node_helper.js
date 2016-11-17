var _  = require('lodash'),
    d3 = require('d3');

var ColorScaleFactory = require('../../utils/color_scale_factory.js');

var BaseNodeHelper = function(config) {
  this.config = config;
  this.colorScale = ColorScaleFactory.gradient([-1, 5], config.style.nodeDepthColorRange);
};

BaseNodeHelper.prototype = Object.create(
  {
    nodeOffset: function(node) {
      return { x: node.x, y: node.y };
    },
    circleNodeFill: function(node) {
      if (node.children) { return this.colorScale(node.depth); }
    },
    circleNodeOpacity: function(node) {
      return 1;
    },
    circleNodeClass: function(node) {
      return node.isRoot() ? 'node node-root' : node.isLeaf() ? 'node node-leaf' : 'node';
    },
    circleNodeRadius: function(node) {
      return node.r;
    },
    textNodeOpacity: function(parentNode, node) {
      return this.nodeFocused(parentNode, node) ? 1 : 0;
    },
    textNodeContent: function(node) {
      return node.data.name; //use nameProperty
    },
    textNodeClass: function(node) {
      var labelClasses = ['label'];
      if (node.children) {
        labelClasses.push('label-parent');
      } else {
        labelClasses.push('label-leaf');
      }
      return labelClasses.join(' ');
    },
    nodeFocused: function(focus, node) {
      return focus === null || focus === undefined || node.parent === focus;
    },
    nodeTooltipTemplateArgs: function(node) {
      return [
        this.config.tooltipInfo.templateId,
        {
          name: node.fullName(),
          data: _.map(this.config.tooltipInfo.templateProperties, function(prop) {
            return { label: prop.label, value: node.data[prop.valueProperty] || 'n/a' };
          })
        }
      ];
    }
  }
);

module.exports = BaseNodeHelper;