package com.collection.service;

import com.collection.entity.Item;
import com.collection.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
//import java.util.Optional;

@Service
public class ItemService {
    
	 @Autowired
   private ItemRepository itemRepository;

   public List<Item> getAllUsers() {
       return itemRepository.findAll(); 
   }

   public Item getUserById(Long id) {
       return itemRepository.findById(id).orElse(null);
   }

   public Item saveUser(Item item) {
       return itemRepository.save(item);
   }

   //  UPDATE USER CORRECT WAY
   public Item updateUser(Long id, Item updatedItem) {
	   Item existing = itemRepository.findById(id).orElse(null);
       if (existing == null) return null;
 
       existing.setTitle(updatedItem.getTitle());
       existing.setDescription(updatedItem.getDescription());
       existing.setTag(updatedItem.getTag());
       existing.setImageUrl(updatedItem.getImageUrl());
       existing.setLinkUrl(updatedItem.getLinkUrl());   
 
       return itemRepository.save(existing);
   }

   public void deleteUser(Long id) {
	   itemRepository.deleteById(id);
   }
}
