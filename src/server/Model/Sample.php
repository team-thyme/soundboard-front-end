<?php

namespace Villermen\Soundboard\Model;

use JsonSerializable;

class Sample implements JsonSerializable
{
	protected $file;
	protected $name;
	protected $mtime;
	protected $categories;
	protected $id;

	public function __construct($file, $url, $mtime)
	{
		$this->file = $file;
		$this->url = $url;
		$this->mtime = $mtime;

		// Conjure a name out of the filename.
		$name = $this->file;
		$slashPosition = strrpos($name, '/');
		if ($slashPosition) {
			$name = substr($name, $slashPosition  + 1);
		}

		$dotPosition = strrpos($name, '.');
		if ($dotPosition) {
			$name = substr($name, 0, $dotPosition);
		}

		// Replace trailing numbers, to allow different files to obtain the same name.
		$this->name = preg_replace('/([^\d])\d{0,2}$/', '\1', $name);

		$this->id = hash('crc32', $this->name);

		// Create categories for each of the relative directories.
		$this->categories = array_slice(explode('/', $this->file), 0, -1);
	}

	public function getFile()
	{
		return $this->file;
	}

	public function getUrl()
	{
		return $this->url;
	}

	public function getName()
	{
		return $this->name;
	}

	public function getMtime()
	{
		return $this->mtime;
	}

	public function getCategories()
	{
		return $this->categories;
	}

	public function getId()
	{
		return $this->id;
	}

	public function jsonSerialize()
	{
		return [
			'url' => $this->getUrl(),
			'name' => $this->getName(),
			'id' => $this->getId(),
			'mtime' => $this->getMtime(),
			'categories' => $this->getCategories()
		];
	}
}
