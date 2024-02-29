<?php
// Class that provides methods for working with the form data.
// There should be NOTHING in this file except this class definition.

class SimpleController {
	private $mapper;

	public function __construct($table)
    {
		global $f3;						// needed for $f3->get()
		$this->mapper = new DB\SQL\Mapper($f3->get('DB'), $table);	// create DB query mapper object
	}

	public function putIntoDatabase($data)
	{
		$this->mapper->name   = $data["name"];
		$this->mapper->colour = $data["colour"];
        $this->mapper->age = $data["age"];
		$this->mapper->save();					 // save new record with these fields
	}

	public function getData()
    {
		return $this->mapper->find();
	}

    public function getRoutePoints($routeID)
    {
        $results = $this->mapper->find(array('RouteID=?',$routeID));
        $coordinates = array();
        foreach ($results as $routePoint){
            $coordinates[] = array($routePoint->Longitude, $routePoint->Latitude);
        }
        return $coordinates;

    }

    public function getElevations($routeID)
    {
        $results = $this->mapper->find(array('RouteID=?',$routeID));
        $coordinates = array();
        foreach ($results as $routePoint){
            $coordinates[] = $routePoint->Elevation;
        }
        return $coordinates;

    }

    public function  getRouteDetail($routeID)
    {
        $result = $this->mapper->load(array('RouteID=?',$routeID));
        return $result;
    }

    public function getRoutesWithDifficulty($difficulty)
    {
        $difficultyStr = implode(',', $difficulty);
        $results = $this->mapper->find('Difficulty IN (' . $difficultyStr . ')');
        $routes = array();
        foreach ($results as $route){
            $routes[] = $route->Name;
        }
        return $routes;

    }


	public function deleteFromDatabase($idToDelete)
    {
		$this->mapper->load(['id=?', $idToDelete]); // load DB record matching the given ID
		$this->mapper->erase();						// delete the DB record
	}
}