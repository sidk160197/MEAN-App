import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

import { AuthService } from './../../auth/auth.service';
import { Post } from './../post.model';
import { PostService } from './../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {

  // posts = [
  //   { title: 'First Post', content: '1st Post.' },
  //   { title: 'Second Post', content: '2nd Post.' },
  //   { title: 'Third Post', content: '3rd Post.' },
  // ];
  posts: Post[] = [];
  subscription: Subscription;
  isLoading: boolean = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 7, 10];
  isAuthenticated = false;
  userId: string;
  private authSubscription: Subscription;


  constructor(private postService: PostService, private authService: AuthService) { }

  ngOnInit(): void {
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.subscription = this.postService.postAdded.subscribe((postData: {posts: Post[], postsCount: number}) => {
      this.posts = postData.posts;
      this.isLoading = false;
      this.totalPosts = postData.postsCount;
    });

    this.isAuthenticated = this.authService.getAuthentication();

    this.authSubscription = this.authService.getAuthStatusListener().subscribe(result => {
      this.isAuthenticated = result;
      this.userId = this.authService.getUserId();
    })
  }

  onDelete(id: string) {
    this.postService.deletePost(id).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.authSubscription.unsubscribe();
  }

}
