var _ = require('lodash'),
    ko = require('knockout');

var DataModel = require('./data_model.js'),
    NodeProxy = require('./node_proxy.js'),
    FilterHandler = require('./filter_handler.js'),
    ZoomHandler = require('./zoom_handler.js'),
    TooltipHandler = require('./tooltip_handler.js'),
    GraphPainter = require('./graph_painter.js');

var CirclePackingDiagram = function(config) {
  var nodeProxy = new NodeProxy(config);
  var filterHandler = new FilterHandler(config.filters, nodeProxy);
  var zoomHandler = new ZoomHandler(config.style.diameter, nodeProxy);
  var tooltipHandler = new TooltipHandler(nodeProxy);
  var graphPainter = new GraphPainter(config.id, nodeProxy, tooltipHandler, zoomHandler, filterHandler);

  var hasValidData = function(node) {
    if (_.isNumber(node[config.series.valueProperty])) {
      return true;
    } else if (node.children) {
      return _.some(node.children, hasValidData);
    }
    return false;
  };

  this.filters = config.filters;
  this.hasData = ko.observable(false);

  this.onData = function(dataTree) {
    if (hasValidData(dataTree)) {
      this.hasData(true);

      graphPainter.draw(new DataModel(config, dataTree, nodeProxy));
    }
  };
};

CirclePackingDiagram.create = function(config) {
  return new CirclePackingDiagram(config);
};

module.exports = CirclePackingDiagram;