package com.collection.controller;
import com.collection.entity.Item;
import com.collection.entity.Tag;
import com.collection.repository.ItemRepository;
import com.collection.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
@RestController  
@RequestMapping("/items")  
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class ItemController {
 
    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private TagRepository tagRepository; 

    // -------- GET ALL --------
    @GetMapping
    public List<Item> getAllUsers() {
        return itemRepository.findAll();
    }

    // -------- GET BY ID (VALIDATION ADDED) --------
    @GetMapping("/{id}")
    public Item getUserById(@PathVariable Long id) {
        // If ID is not found, throw 404 NOT FOUND
        return itemRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found with ID: " + id));
    } 

    // -------- CREATE --------
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Item item) {

        try {
            if (item.getTag() != null) {

                // Validate by tagName
                String tagName = item.getTag().getTagName();
                Long tagId = item.getTag().getTagId();

                Tag existingTag = null;

                // Case 1: Tag ID is provided
                if (tagId != null) {
                    existingTag = tagRepository.findById(tagId)
                            .orElseThrow(() -> new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "Invalid Tag ID: " + tagId + ". Only existing tags are allowed."
                            ));
                }

                // Case 2: Tag name is provided
                else if (tagName != null) {
                    existingTag = tagRepository.findByTagName(tagName);
                    if (existingTag == null) {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Invalid Tag Name: " + tagName + ". Only existing tags are allowed."
                        );
                    }
                }

                // If valid → assign tag
                item.setTag(existingTag);
            }

            Item savedItem = itemRepository.save(item);
            return ResponseEntity.ok(savedItem);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating item: " + e.getMessage());
        }
    }

 
    // -------- UPDATE (VALIDATION ADDED) --------
    @PutMapping("/{id}")
    public ResponseEntity<Item> updateUser(@PathVariable Long id, @RequestBody Item updatedItem) {
        // Find the existing item or throw 404 NOT FOUND
        Item existing = itemRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found with ID: " + id));

        try {
            existing.setTitle(updatedItem.getTitle());
            existing.setDescription(updatedItem.getDescription());
            existing.setImageUrl(updatedItem.getImageUrl());
            existing.setLinkUrl(updatedItem.getLinkUrl());

            // Handle tag update properly (Logic remains the same)
            if (updatedItem.getTag() != null && updatedItem.getTag().getTagName() != null) {
                Tag tag = tagRepository.findByTagName(updatedItem.getTag().getTagName());
                if (tag != null) {
                    existing.setTag(tag);
                } else {
                    // Create new tag if it doesn't exist
                    Tag newTag = new Tag();
                    newTag.setTagName(updatedItem.getTag().getTagName());
                    Tag savedTag = tagRepository.save(newTag);
                    existing.setTag(savedTag);
                }
            } else {
                existing.setTag(null);
            }

            Item savedItem = itemRepository.save(existing); 
            return ResponseEntity.ok(savedItem);
        } catch (Exception e) {
            // Catches any internal error during save/tag handling, returns 400 Bad Request
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error updating item: " + e.getMessage());
        }
    }

    @GetMapping("/tag") // Maps to /items/tag?name={tagName}
    public List<Item> getItemsByTagName(@RequestParam("name") String tagName) {
        // Assuming the repository returns an empty list [] if no items are found for the tag,
        // which is usually acceptable (200 OK with empty array).
        return itemRepository.findItemsByTagTagName(tagName);  
    }
     
    // -------- SEARCH BY KEYWORD -------- 
    @GetMapping("/search")
	public ResponseEntity<List<Item>> searchCard(@RequestParam(required=false) String match){
        // Assuming the repository returns an empty list [] if no items match, 
        // which is usually acceptable (200 OK with empty array).
		List<Item> cards= itemRepository.searchItems(match);
		return ResponseEntity.ok(cards);
	}
     
    // -------- DELETE (VALIDATION ADDED) --------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!itemRepository.existsById(id)) {
            // If item doesn't exist, throw 404 NOT FOUND
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found with ID: " + id);
        }
        
        try {
            itemRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
             // Catches any internal error during deletion, returns 400 Bad Request
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error deleting item: " + e.getMessage());
        }
    }
}