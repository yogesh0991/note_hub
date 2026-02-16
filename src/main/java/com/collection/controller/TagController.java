package com.collection.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.collection.entity.Tag;
import com.collection.service.TagService;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
@RequestMapping("/tags")
public class TagController {
	    @Autowired
	    private TagService tagService;
	    
	    // GET all tags
	    @GetMapping
	    public List<Tag> getAllTags() {
	        return tagService.getAllTags();
	    }
	    
	    // GET tag By ID (VALIDATION ADDED)
	    @GetMapping("/{id}")
	    public Tag getSingleTag(@PathVariable Long id) {
            // If ID is not found, throw 404 NOT FOUND
	        Tag tag = tagService.getTagById(id);
            if (tag == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tag not found with ID: " + id);
            }
            return tag;
	    }
	}