package com.collection.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "tags")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")   // DB column
    private Long tagId;        // Java variable

    @Column(name = "tag_name", nullable = false, unique = true)  // DB column
    private String tagName;    // Java variable

    // Getters & Setters
    public Long getTagId() { return tagId; }
    public void setTagId(Long tagId) { this.tagId = tagId; }

    public String getTagName() { return tagName; }
    public void setTagName(String tagName) { this.tagName = tagName; }
}

