import * as model from '../models/model';

function getPercentage(num){
  return (num*100).toFixed(2) + ' %';
}

export const displayRouteMainPage = function (req, res){
  res.render('route_main_page'); 
}


export const getRoute = function (req, res){

  var route_short_name = req.query.route_short_name;

  model.getRoute().then( results => {
    let result = results.find( x => x.route_short_name === route_short_name);

    console.info(result);
    result = {
      route_id: result.route_id,
      agency_name: result.agency_name,
      route_desc: result.route_desc,
      route_short_name: result.route_short_name,
      route_long_name: result.route_long_name,
      early_percentage: getPercentage(result.Percentage), //TODO:change names
      ontime_percentage: getPercentage(result.Percentage), //TODO:change names
      late_percentage: getPercentage(result.Percentage), //TODO:change names
      verylate_percentage: getPercentage(result.Percentage), //TODO:change names
      route_performance: result.route_performance //TODO:change names
    };
    res.render('route_page',{bus:result}); //index.ejs
  });

};
