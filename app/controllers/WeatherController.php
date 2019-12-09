<?php

use Phalcon\Mvc\Controller;

class WeatherController extends Controller
{
	public function showHistoryAction()
	{
		$this->view->history = History::find();
	}

    public function cityForecastAction()
    {
        //save history

        $history = new History();

        $date = date("m.d.y");
        $time = date("H:i:s");

        $success = $history->save(
            [
                'city' => $this->request->getPost(), 
                'date' => $date,
                'time' => $time,
            ]
        );

        if (! $success) {

            $messages = $history->getMessages();

            foreach ($messages as $message)
            {
                echo $message->getMessage(), "<br/>";
            }
        }


        //Get data by city name

        $city = $_POST["city"];
        $units = "metric";
        $lang = "en";
        $countDay = 1;
        $appID = "8f289f7ebb567e8486b677bed632b713";

        $url = "http://api.openweathermap.org/data/2.5/forecast?q=$city&cnt=$countDay&lang=$lang&units=$units&appid=$appID";

        $data = @file_get_contents($url);

        // Pass parameter to the view
        $this->view->dataJson = json_decode($data);
    }

    public function coordinateForecastAction()
    {
        //Get data by coordinates

        $latitude = $_POST["lat"];
        $longitude = $_POST["lng"];
        $units = "metric";
        $lang = "en";
        $countDay = 1;
        $appID = "8f289f7ebb567e8486b677bed632b713";
 
        $url = "https://api.openweathermap.org/data/2.5/weather?lat=$latitude&lon=$longitude&lang=$lang&cnt=$countDay&units=$units&appid=$appID";

        $data = @file_get_contents($url);

    	// Pass parameter to the view
        $this->view->dataJson = json_decode($data);
    }
}