---
layout: single
title: "David's Model"
permalink: /archive/davids-model
excerpt: "A guide for content modeling by David Nuescheler"
date:   2007-08-22 11:30:43 -0000
comments: true
#categories:
#  - archives
#tags:
#  - reference
#  - backup
header:
  overlay_image: /assets/images/site-logo.png
---

{% include toc_sticky.html %}

In various discussions I found that developers are somewhat at unease with the features and functionalities presented by JCR when it comes to content modeling. There is no guide and very little experience yet on how to model content in a repository and why one content model is better than the other.

While in the relational world the software industry has a lot of experience on how to model data, we are still at the early stages for the content repository space.

I would like to start filling this void by expressing my personal opinions on how content should be modeled, hoping that this could some day graduate into something more meaningful to the developers community, which is not just "my opinion" but something that is more generally applicable. So consider this my quickly evolving first stab at it.

Disclaimer: These guidelines express my personal, sometimes controversial views. I am looking forward to debate these guidelines and refine them.

Seven Simple rules

## Rule #1: Data First, Structure Later. Maybe.

**Explanation**

I recommend not to worry about a declared data structure in an ERD sense. Initially.

Learn to love nt:unstructured (& friends) in development.


I think [Stefano pretty much sums this one up](/archive/data-first-vs-structure-first).

My bottom-line: Structure is expensive and in many cases it is entirely unnecessary to explicitly declare structure to the underlying storage.

There is an implicit contract about structure that your application inherently uses. Let's say I store the modification date of a blog post in a "lastModified" property. My App will automatically know to read the modification date from that same property again, there is really no need to declare that explicitly.

Further data constraints like mandatory or type and value constraints should only be applied where required for data integrity reasons.

**Example**

The above example of using a "lastModified" Date property on for example "blog post" node, really does not mean that there is a need for a special nodetype. I would definitely use "nt:unstructured" for my blog post nodes at least initially. Since in my blogging application all I am going to do is to display the lastModified date anyway (possibly "order by" it) I barely care if it is a Date at all. Since I implicitly trust my blog-writing application to put a "date" there anyway, there really is no need to declare the presence of a "lastModified" date in the form a of nodetype.


## Rule #2: Drive the content hierarchy, don't let it happen.

**Explanation**

The content hierarchy is a very valuable asset. So don't just let it happen, design it. If you don't have a "good", human-readable name for a node, that's probably that you should reconsider. Arbitrary numbers are hardly ever a "good name".

While it may be extremely easy to quickly put an existing relational model into a hierarchical model, one should put some thought in that process.

In my experience access control and containment are usually good drivers for the content hierarchy. Think of it as if it was your filesystem. Maybe even use files and folders to model it on your local disk.

Personally I prefer hierarchy conventions over the nodetyping system in a lot of cases initially, and introduce the typing later.

**Example**

I would model a simple blogging system as follows. Please note that initially I don't even care about the respective nodetypes that I use at this point.

```
/content/myblog
/content/myblog/posts
/content/myblog/posts/what_i_learned_today
/content/myblog/posts/iphone_shipping

/content/myblog/comments/iphone_shipping/i_like_it_too
/content/myblog/comments/iphone_shipping/i_like_it_too/i_hate_it
```

I think one of the things that become apparent is that we all understand the structure of the content based on the example without any further explanations.

What may be unexpected initially is why I wouldn't store the "comments" with the "post", which is due to access control which I would like to be applied in a reasonably hierarchical way.

Using the above content model I can easily allow the "anonymous" user to "create" comments, but keep the anonymous user on a read-only basis for the rest of the workspace.


## Rule #3: Workspaces are for clone(), merge() and update().

**Explanation**

If you don't use clone(), merge() or update() methods in your application a single workspace is probably the way to go.

"Corresponding nodes" is a concept defined in the JCR spec. Essentially, it boils down to nodes that represent the same content, in different so-called workspaces.

JCR introduces the very abstract concept of Workspaces which leaves a lot of developers unclear on what to do with them. I would like to propose to put your use of workspaces to the following to test.

If you have a considerable overlap of "corresponding" nodes (essentially the nodes with the same UUID) in multiple workspaces you probably put workspaces to good use.

If there is no overlap of nodes with the same UUID you are probably abusing workspaces.

Workspaces should not be used for access control. Visibility of content for a particular group of users is not a good argument to separate things into different workspaces. JCR features "Access Control" in the content repository to provide for that.

Workspaces are the boundary for references and query.

**Example**

Use workspaces for things like:

* v1.2 of your project vs. a v1.3 of your project
* a "development", "qa" and a "published" state of content

Do not use workspaces for things like:

* user home directories
* distinct content for different target audiences like public, private, local, ...
* mail-inboxes for different users

## Rule #4: Beware of Same Name Siblings.


**Explanation**

While Same Name Siblings (SNS) have been introduced into the spec to allow compatibility with data structures that are designed for and expressed through XML and therefore are extremely valuable to JCR, SNS come with a substantial overhead and complexity for the repository.

Any path into the content repository that contains an SNS in one of its path segments becomes much less stable, if an SNS is removed or reordered, it has an impact on the paths of all the other SNS and their children.

For import of XML or interaction with existing XML SNS maybe necessary and useful but I have never used SNS, and never will in my "green field" data models.

**Example**

Use

```
/content/myblog/posts/what_i_learned_today
/content/myblog/posts/iphone_shipping
```

instead of

```
/content/blog[1]/post[1]
/content/blog[1]/post[2]
```

## Rule #5: References considered harmful.

**Explanation**
References imply referential integrity. I find it important to understand that references do not just add additional cost for the repository managing the referential integrity, but they also are costly from a content flexibility perspective.

Personally I make sure I only ever use references when I really cannot deal with a dangling reference and otherwise use a path, a name or a string UUID to refer to another node.

**Example**

Let's assume I allow "references" from a document (a) to another document (b). If I model this relation using reference properties this means that the two documents are linked on a repository level. I cannot export/import document (a) individually, since the reference property's target may not exist. Other operations like merge, update, restore or clone are affected as well.

So I would either model those references as "weak-references" (in JCR v1.0 his essentially boils down to string properties that contain the uuid of the target node) or simply use a path. Sometimes the path is more meaningful to begin with.

I think there are usecases where a system really can't work if a reference is dangling, but I just can't come up with a good "real" yet simple example from my direct experience.

## Rule #6: Files are Files are Files.

**Explanation**

If a content model exposes something that even remotely "smells" like a file or a folder I try to use (or extend from) nt:file, nt:folder and nt:resource.

In my experience a lot of generic applications allow interaction with nt:folder and nt:files implicitly and know how to handle and display those event if they are enriched with additional meta-information. For example a direct interaction with file server implementations like CIFS or Webdav sitting on top of JCR become implicit.

I think as good rule of thumb one could use the following:
If you need to store the filename and the mime-type then nt:file/nt:resource is a very good match. If you could have multiple "files" an nt:folder is a good place to store them.

If you need to add meta information for your resource, let's say an "author" or a "description" property, extend nt:resource not the nt:file. I rarely extend nt:file and frequently extend nt:resource.

**Example**

Let's assume that someone would like to upload an image to a blog entry at:

```
/content/myblog/posts/iphone_shipping
```

and maybe the initial gut reaction would be to add a binary property containing the picture.

While there certainly are good usecases to use just a binary property (let's say the name is irrelevant and the mime-type is implicit) in this case I would recommend the following structure for my blog example.

```
/content/myblog/posts/iphone_shipping/attachments [nt:folder]
/content/myblog/posts/iphone_shipping/attachments/front.jpg [nt:file]
/content/myblog/posts/iphone_shipping/attachments/front.jpg/jcr:content [nt:resource]
```


## Rule #7: ID's are evil.

**Explanation**

In relational databases IDs are a necessary means to express relations, so people tend to use them in content models aswell. Mostly for the wrong reasons through.

If your content model is full of properties that end in "Id" you probably are not leveraging the hierarchy properly.

It is true that some nodes need a stable identification throughout their live cycle. Much fewer than you might think though. mix:referenceable provides such a mechanism built into the repository, so there really is no need to come up with an additional means of identifying a node in a stable fashion.

Keep also in mind that items can be identified by path, and as much as "symlinks" make way more sense for most users than hardlinks in a unix filesystem, a path makes a sense for most applications to refer to a target node.

More importantly, it is **mix**:referenceable which means that it can be applied to a node at the point in time when you actually need to reference it.

So let's say just because you would like to be able to potentially reference a node of type "Document" does not mean that your "Document" nodetype has to extend from mix:referenceable in a static fashion since it can be added to any instance of the "Document" dynamically.

**Example**

use:

```
/content/myblog/posts/iphone_shipping/attachments/front.jpg
```

instead of:

```
[Blog]
- blogId
- author

[Post]
- postId
- blogId
- title
- text
- date

[Attachment]
- attachmentId
- postId
- filename
+ resource (nt:resource)
```
