<?php
//==============================================================================
// index.php for SimpleExample app //

// Create f3 object then set various global properties of it
// These are available to the routing code below, but also to any
// classes defined in autoloaded definitions

$home = '/home/'.get_current_user();

$f3 = require($home.'/AboveWebRoot/fatfree-master/lib/base.php');

// autoload Controller class(es) and anything hidden above web root, e.g. DB stuff
$f3->set('AUTOLOAD','autoload/;'.$home.'/AboveWebRoot/autoload/');

$db = DatabaseConnection::connect(); // defined as autoloaded class in AboveWebRoot/autoload/
$f3->set('DB', $db);

$f3->set('DEBUG',3);		// set maximum debug level
$f3->set('UI','ui/');		// folder for View templates
//==============================================================================
// Simple Example URL application routings

//home page (index.html) -- actually just shows form entry page with a different title
$f3->route('GET /',
    function ($f3)
    {
        $f3->set('html_title','Simple Example Home');
        $f3->set('content','simpleHome.html');
        echo template::instance()->render('layout.html');
    }
);
//==============================================================================
// When using GET, provide a form for the user to upload an image via the file input type
$f3->route('GET /simpleform',
    function($f3)
    {
        $f3->set('html_title','Simple Input Form');
        $f3->set('content','simpleform.html');
        echo template::instance()->render('layout.html');
    }
);

//$f3->route('GET /home',
//    function($f3)
//    {
////        $f3->set('html_title','home');
////        $f3->set('content','home.html');
//        $controller = new SimpleController('RoutePoints');
//        $route_data = json_encode($controller->getRoutePoints(1));
//        $f3->set("route_data", $route_data);
//        $f3->set('html_title','Viewing the data');
//        $f3->set('content','dataView.html');
//
//        echo template::instance()->render('home.html');
//    }
//);

$f3->route('GET /mapbox',
    function($f3)
    {
//        $f3->set('html_title','home');
//        $f3->set('content','home.html');
        $controller = new SimpleController('RoutePoints');
        $controller2 = new SimpleController('Routes');
        $routes = $controller2->getData();
        $route_data = json_encode($controller->getRoutePoints(1));
        $f3->set("routes", $routes);
        $f3->set("route_data", $route_data);
        $f3->set('html_title','Viewing the data');
        $f3->set('content','dataView.html');

        echo template::instance()->render('mapbox.html');
    }
);

//==============================================================================
// When using POST (e.g.  form is submitted), invoke the controller, which will process
// any data then return info we want to display. We display
// the info here via the response.html template
$f3->route('POST /simpleform',
    function($f3)
    {
        $formdata = array();			// array to pass on the entered data in
        $formdata["name"] = $f3->get('POST.name');			// whatever was called "name" on the form
        $formdata["colour"] = $f3->get('POST.colour');		// whatever was called "colour" on the form
        $formdata["age"] = (int)$f3->get('POST.age');
        $controller = new SimpleController('simpleModel');
        $controller->putIntoDatabase($formdata);

        $f3->set('formData',$formdata);		// set info in F3 variable for access in response template
        $f3->set('html_title','Simple Example Response');
        $f3->set('content','response.html');
        echo template::instance()->render('layout.html');
    }
);
//==============================================================================
$f3->route('GET /dataView',
    function($f3)
    {
        $controller = new SimpleController('simpleModel');
        $alldata = $controller->getData();

        $f3->set("dbData", $alldata);
        $f3->set('html_title','Viewing the data');
        $f3->set('content','dataView.html');
        echo template::instance()->render('layout.html');
    }
);
//==============================================================================
$f3->route('GET /editView',				// exactly the same as dataView, apart from the template used
    function($f3)
    {
        $controller = new SimpleController('simpleModel');
        $alldata = $controller->getData();

        $f3->set("dbData", $alldata);
        $f3->set('html_title','Viewing the data');
        $f3->set('content','editView.html');
        echo template::instance()->render('layout.html');
    }
);
//==============================================================================
$f3->route('POST /editView',
    function($f3)
    {
        $controller = new SimpleController('simpleModel');
        $controller->deleteFromDatabase($f3->get('POST.toDelete'));		// in this case, delete selected data record
        $f3->reroute();
    }
);

//==============================================================================

$f3->route('GET /about',
    function($f3)
    {
        $file = F3::instance()->read('README.md');
        $html = Markdown::instance()->convert($file);
        $f3->set('html_title', "FFF-SimpleExample");
        $f3->set('article_html', $html);
        $f3->set('content','article.html');
        echo template::instance()->render('layout.html');
    }
);

$f3->route('GET /home',
    function ($f3)
    {
        echo template::instance()->render('DWDHomepage.html');
    }


);



$f3->route('POST /get-route-data',
    function ($f3){
        $json=file_get_contents("php://input");
        $param=json_decode($json,true);
        $routeId = $param['RouteId'];
        $controller = new SimpleController('RoutePoints');
        $route_data = json_encode($controller->getRoutePoints($routeId));
        header('Content-Type: application/json');
        echo json_encode($route_data);
    }
);

$f3->route('POST /get-routes-summary',
    function ($f3){
        $json=file_get_contents("php://input");
        $param=json_decode($json,true);
        $routeId = $param['RouteId'];
        $routePointsController = new SimpleController('RoutePoints');
        $elevation_data=$routePointsController->getElevations($routeId);
        $routesController = new SimpleController(('Routes'));
        $length = $routesController->getRouteDetail($routeId)->Length;
        $name = $routesController->getRouteDetail($routeId)->Name;
        $duration=$routesController->getRouteDetail($routeId)->Duration;
        $difficulty=$routesController->getRouteDetail($routeId)->Difficulty;
        $data = array("elevations"=>$elevation_data, "length"=>$length, "name"=>$name, "duration"=>$duration, "difficulty"=>$difficulty);
        header('Content-Type: application/json');
        echo json_encode($data);
    }
);


$f3->route('POST /get-routes-with-difficulty',
    function ($f3){
        $json=file_get_contents("php://input");
        $param=json_decode($json,true);
        $difficulty = $param['difficulty'];
        $dict=array('easy-option'=>1, 'medium-option'=>2, 'hard-option'=>3);
        $body = array();
//        print($difficulty[0]);
        foreach ($difficulty as $option){
            $body[] = $dict[$option];
        }

        $routesController = new SimpleController('Routes');
        $routes= $routesController->getRoutesWithDifficulty($body);
        $data=array("routes"=>$routes);
        error_log(json_encode($data) . "\n",3, './debuglog');
        header('Content-Type: application/json');
        echo json_encode($data);
    });


// 显示注册表单的路由
$f3->route('GET /register',
    function($f3) {
        $controller = new UserController(); // 创建UserController实例
        $controller->registerForm($f3); // 调用registerForm方法来渲染注册表单
    }
);

// 处理注册逻辑的路由
$f3->route('POST /register',
    function($f3) {
        $controller = new UserController(); // 创建UserController实例
        $controller->register($f3); // 调用register方法处理注册逻辑
    }
);

$f3->route('GET /success',
    function($f3) {
        $f3 -> set('content', 'success.html');
        echo template::instance()->render('success.html');
    }
);

// 显示登录表单
$f3->route('GET /login',
    function($f3) {
        $controller = new LoginController(); // 创建LoginController实例
        $controller->render($f3); // 调用render方法来渲染登录表单
    }
);

$f3->route('POST /login',
    function($f3) {
        $controller = new LoginController();

        // 获取JSON格式的POST数据
        $rawData = file_get_contents("php://input");
        if (!empty($rawData)) {
            $data = json_decode($rawData, true); // 解码JSON数据
            if ($data) {
                // 将解码后的数据放入$f3的POST数组中
                foreach ($data as $key => $value) {
                    $f3->set('POST.'.$key, $value);
                }
            }
        }

        $controller->login($f3); // 调用login方法处理登录逻辑
    }
);



//==============================================================================
function pprint_var($var)
{
    ob_start();
    var_dump($var);
    return ob_get_clean();
}

$f3->set('ONERROR', // what to do if something goes wrong.
    function($f3) {
        $f3->set('html_title',$f3['ERROR']['code']);
        $f3->set('DUMP', pprint_var($f3['ERROR']));
        $f3->set('content','error.html');
        echo template::instance()->render('layout.html');
    }
);

//==============================================================================
// Run the FFF engine //
$f3->run();
