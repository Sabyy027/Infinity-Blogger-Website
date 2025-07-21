import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, likeBlog, commentBlog } from '../features/blog/blogSlice';

export default function BlogList() {
  const dispatch = useDispatch();
  const blogs = useSelector(state => state.blogs.items);

  useEffect(() => { dispatch(fetchBlogs()); }, [dispatch]);

  return (
    <div className="space-y-8">
      {blogs.map(blog => (
        <div key={blog._id} className="p-4 border rounded">
          <h2 className="text-xl font-bold">{blog.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          <div className="flex items-center gap-4 mt-2">
            <button onClick={() => dispatch(likeBlog(blog._id))}>Like ({blog.likes.length})</button>
          </div>
          <div>
            <form onSubmit={e => {
              e.preventDefault();
              dispatch(commentBlog({ blogId: blog._id, text: e.target.elements.text.value }));
              e.target.reset();
            }}>
              <input name="text" className="border p-1" placeholder="Add comment..." />
              <button type="submit">Comment</button>
            </form>
            <ul>
              {blog.comments.map((c, idx) => (
                <li key={idx}>{c.text}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
