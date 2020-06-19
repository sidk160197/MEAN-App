export class Post {
    id: string;
    title: string;
    content: string;
    imagePath: string;
    creator: string;

    constructor(title: string, content: string) {
        this.title = title;
        this.content = content;
    }
}