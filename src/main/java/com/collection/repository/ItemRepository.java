package com.collection.repository;

import com.collection.entity.Item; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> { 

    // OLD: List<Item> findByTagTagName(String tagName); // REMOVE THIS LINE
    
    // 2. SEARCH BY KEYWORD (Your existing custom search query)
	@Query("SELECT i FROM Item i WHERE LOWER(i.title) LIKE LOWER(CONCAT('%', :match, '%')) " +
	           "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :match, '%'))")
	    List<Item> searchItems(@Param("match") String match);

	@Query("SELECT i FROM Item i WHERE i.tag.tagName = :tagName")
    List<Item> findItemsByTagTagName(@Param("tagName") String tagName);
}