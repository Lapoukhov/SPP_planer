<?php

use Phalcon\Mvc\Model;

class History extends Model
{
	public $id;
    public $city;
    public $date;
    public $time;

    public function initialize()
    {
        $this->setSource('history');
    }

}