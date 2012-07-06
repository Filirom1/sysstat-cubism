cubism.sysstat = function(context, host) {
  if (!arguments.length) host = "";
  var source = {},
      initialized_metrics = {},
      callbacks = [];

  source.metric = function(metric_id) {
    return context.metric(function(start, stop, step, callback) {
      callbacks.push({metric_id: metric_id, callback: callback});
      loadData(host, function(stats) {
        callbacks.forEach(function(o){
          metric_id = o.metric_id;
          callback = o.callback;
          if (!stats) return callback(new Error("unable to load data"));
          start = +start;
          stop = +stop;
          var  values    = [],
          value     = stats[metric_id];

          // Cubism.js expects a value for every "slot" based on the `start` and `stop` parameters, because
          // it assumes a backend such as [_Graphite_](https://github.com/square/cubism/wiki/Graphite),
          // which is able to return values stored over time.
          //
          // Here we don't have any data stored: we poll the API repeatedly.
          //
          // On first call, Cubism.js calls the metric callback function with a large `start` and `stop` gap,
          // based on the `step` and `size` values of your chart. This would spoil the chart with a useless
          // "thick colored line".
          //
          // So: if we have already initialized this metric, push the same value to all the "slots",
          // because this is what Cubism.js expects...
          if (initialized_metrics[metric_id]) {
            while (start < stop) {
              start += step;
              values.push(value);
            }
          }
          // ... otherwise mark this metric as initialized and fill the empty / "historical" slots with empty values.
          else {
            initialized_metrics[metric_id] = true;
            while (start < (stop - step)) {
              start += step;
              values.push(NaN);
            }
            values.push(value);
          }

          callback(null, values);
        });
        callbacks = [];
      });
    }, metric_id += "");
  };

  source.toString = function() {
    return host;
  };

  var loadData = _.debounce(d3.json, 100);

  return source;
};
