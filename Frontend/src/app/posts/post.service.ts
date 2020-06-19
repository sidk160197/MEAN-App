import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Post } from './post.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PostService {
    posts: Post[] = [];

    constructor(private httpClient: HttpClient, private router: Router) {}

    postAdded = new Subject<{posts: Post[], postsCount: number}>();

    addPost(post: Post, image: File) {
        const postData = new FormData();
        postData.append('title', post.title);
        postData.append('content', post.content);
        postData.append('image', image, post.title);
        this.httpClient.post<{ message: string, post: any }>(`${environment.URL}/post`, postData)
            .pipe(map(data => {
                return {
                    id: data.post._id,
                    title: data.post.title,
                    content: data.post.content,
                    imagePath: data.post.imagePath
                }
            }))
            .subscribe((post) => {
                // console.log(data.message);
                this.router.navigate(['/']);
            });
    }

    getPosts(postsPerPage: number, currentPage: number) {
        // return this.posts.slice();
        const queryParameters = `?pageSize=${postsPerPage}&page=${currentPage}`;
        this.httpClient.get<{ message: string, posts: any[], postsCount: number }>(`${environment.URL}/posts` + queryParameters)
            .pipe(map(postData => {
                return {
                    posts: postData.posts.map(post => {
                        return {
                            id: post._id,
                            title: post.title,
                            content: post.content,
                            imagePath: post.imagePath,
                            creator: post.creator
                        }
                    }),
                    postsCount: postData.postsCount
                }
            }))
            .subscribe((postData) => {
                this.posts = postData.posts;
                this.postAdded.next({posts: [...this.posts], postsCount: postData.postsCount});
            });
    }

    deletePost(id: string) {
        return this.httpClient.delete<{ message: string }>(`${environment.URL}/post/${id}`);
    }

    getPost(id: string) {
        return this.httpClient.get(`${environment.URL}/post/${id}`);
    }

    editPost(id: string, title: string, content: string, image: any) {
        // const post: Post = new Post(title, content);
        let postData: Post | FormData;
        if(typeof(image) === 'object') {
            postData = new FormData();
            postData.append('title', title);
            postData.append('content', content);
            postData.append('image', image, title);
        } else {
            postData = {
                id,
                title,
                content,
                imagePath: image,
                creator: null
            };
        }
        this.httpClient.put<{ message: string }>(`${environment.URL}/post/${id}`, postData)
            .subscribe((data) => {
            });
    }
}