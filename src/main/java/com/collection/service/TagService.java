package com.collection.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.collection.entity.Tag;
import com.collection.repository.TagRepository;

import java.util.List;

	@Service 
	public class TagService {

	    @Autowired
	    private TagRepository tagRepository;

	    // GET all tags
	    public List<Tag> getAllTags() {
	        return tagRepository.findAll();
	    }

	    // GET tag by id
	    public Tag getTagById(Long id) {
	        return tagRepository.findById(id).orElse(null);
	    }
	}
	

