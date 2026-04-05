import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const FeedPage = () => {
  const { user, logout } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [postForm, setPostForm] = useState({ text: '', image: '', visibility: 'public' });
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});

  const firstName = useMemo(() => user?.firstName || 'User', [user]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/posts');
      setPosts(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (!postForm.text.trim()) {
      return;
    }

    try {
      await api.post('/posts', postForm);
      setPostForm({ text: '', image: '', visibility: 'public' });
      await fetchFeed();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create post');
    }
  };

  const togglePostLike = async (postId) => {
    await api.patch(`/posts/${postId}/likes`);
    await fetchFeed();
  };

  const addComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) {
      return;
    }

    await api.post(`/posts/${postId}/comments`, { text });
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    await fetchFeed();
  };

  const toggleCommentLike = async (postId, commentId) => {
    await api.patch(`/posts/${postId}/comments/${commentId}/likes`);
    await fetchFeed();
  };

  const addReply = async (postId, commentId) => {
    const key = `${postId}:${commentId}`;
    const text = replyInputs[key]?.trim();
    if (!text) {
      return;
    }

    await api.post(`/posts/${postId}/comments/${commentId}/replies`, { text });
    setReplyInputs((prev) => ({ ...prev, [key]: '' }));
    await fetchFeed();
  };

  const toggleReplyLike = async (postId, commentId, replyId) => {
    await api.patch(`/posts/${postId}/comments/${commentId}/replies/${replyId}/likes`);
    await fetchFeed();
  };

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_main_layout">
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
          <div className="container _custom_container">
            <div className="_logo_wrap">
              <a className="navbar-brand" href="#feed">
                <img src="/assets/images/logo.svg" alt="Image" className="_nav_logo" />
              </a>
            </div>
            <div className="collapse navbar-collapse show">
              <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
                <li className="nav-item _header_nav_item">
                  <button type="button" className="_social_login_form_btn_link _btn1" onClick={logout}>
                    Logout
                  </button>
                </li>
              </ul>
              <div className="_header_nav_profile">
                <div className="_header_nav_profile_image">
                  <img src="/assets/images/profile.png" alt="Image" className="_nav_profile_img" />
                </div>
                <div className="_header_nav_dropdown">
                  <p className="_header_nav_para">{firstName}</p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
                      <ul className="_left_inner_area_explore_list">
                        <li className="_left_inner_area_explore_item"><span className="_left_inner_area_explore_link">Feed</span></li>
                        <li className="_left_inner_area_explore_item"><span className="_left_inner_area_explore_link">Posts</span></li>
                        <li className="_left_inner_area_explore_item"><span className="_left_inner_area_explore_link">Comments</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <div className="_feed_inner_create_post _feed_inner_area _b_radious6 _padd_t24 _padd_b24 _padd_r24 _padd_l24 _mar_b16">
                      <form onSubmit={handleCreatePost}>
                        <div className="_mar_b12">
                          <textarea
                            className="form-control _social_login_input"
                            rows="3"
                            placeholder="What's on your mind?"
                            value={postForm.text}
                            onChange={(e) => setPostForm((prev) => ({ ...prev, text: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="row">
                          <div className="col-8">
                            <input
                              type="url"
                              className="form-control _social_login_input"
                              placeholder="Image URL (optional)"
                              value={postForm.image}
                              onChange={(e) => setPostForm((prev) => ({ ...prev, image: e.target.value }))}
                            />
                          </div>
                          <div className="col-4">
                            <select
                              className="form-control _social_login_input"
                              value={postForm.visibility}
                              onChange={(e) => setPostForm((prev) => ({ ...prev, visibility: e.target.value }))}
                            >
                              <option value="public">Public</option>
                              <option value="private">Private</option>
                            </select>
                          </div>
                        </div>
                        <div className="_mar_t16">
                          <button type="submit" className="_social_login_form_btn_link _btn1">Create Post</button>
                        </div>
                      </form>
                    </div>

                    {loading ? <p>Loading feed...</p> : null}
                    {error ? <p style={{ color: '#ff4d4f' }}>{error}</p> : null}

                    {posts.map((post) => (
                      <div key={post._id} className="_feed_inner_area _b_radious6 _padd_t24 _padd_b24 _padd_r24 _padd_l24 _mar_b16">
                        <div className="d-flex justify-content-between align-items-center _mar_b12">
                          <h4 className="_title5 _mar_b0">
                            {post.author?.firstName} {post.author?.lastName}
                          </h4>
                          <span>{post.visibility}</span>
                        </div>
                        <p className="_mar_b12">{post.text}</p>
                        {post.image ? <img src={post.image} alt="post" className="img-fluid _mar_b12" /> : null}
                        <div className="d-flex gap-2 _mar_b12">
                          <button type="button" className="_social_login_form_btn_link _btn1" onClick={() => togglePostLike(post._id)}>
                            Like ({post.likes?.length || 0})
                          </button>
                          <span>
                            {post.likes?.map((entry) => `${entry.user?.firstName || ''} ${entry.user?.lastName || ''}`.trim()).filter(Boolean).join(', ')}
                          </span>
                        </div>

                        <div className="_mar_b12">
                          <div className="row">
                            <div className="col-9">
                              <input
                                type="text"
                                className="form-control _social_login_input"
                                placeholder="Write a comment"
                                value={commentInputs[post._id] || ''}
                                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))}
                              />
                            </div>
                            <div className="col-3">
                              <button type="button" className="_social_login_form_btn_link _btn1" onClick={() => addComment(post._id)}>
                                Comment
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          {(post.comments || []).map((comment) => {
                            const replyKey = `${post._id}:${comment._id}`;
                            return (
                              <div key={comment._id} className="_mar_b12" style={{ borderTop: '1px solid #ddd', paddingTop: '12px' }}>
                                <p>
                                  <strong>
                                    {comment.author?.firstName} {comment.author?.lastName}
                                  </strong>{' '}
                                  {comment.text}
                                </p>
                                <div className="d-flex gap-2 _mar_b8">
                                  <button
                                    type="button"
                                    className="_social_login_form_btn_link _btn1"
                                    onClick={() => toggleCommentLike(post._id, comment._id)}
                                  >
                                    Like ({comment.likes?.length || 0})
                                  </button>
                                  <span>
                                    {comment.likes
                                      ?.map((entry) => `${entry.user?.firstName || ''} ${entry.user?.lastName || ''}`.trim())
                                      .filter(Boolean)
                                      .join(', ')}
                                  </span>
                                </div>

                                <div className="row _mar_b8">
                                  <div className="col-9">
                                    <input
                                      type="text"
                                      className="form-control _social_login_input"
                                      placeholder="Reply"
                                      value={replyInputs[replyKey] || ''}
                                      onChange={(e) => setReplyInputs((prev) => ({ ...prev, [replyKey]: e.target.value }))}
                                    />
                                  </div>
                                  <div className="col-3">
                                    <button
                                      type="button"
                                      className="_social_login_form_btn_link _btn1"
                                      onClick={() => addReply(post._id, comment._id)}
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>

                                {(comment.replies || []).map((reply) => (
                                  <div key={reply._id} style={{ marginLeft: '20px', marginTop: '8px' }}>
                                    <p>
                                      <strong>
                                        {reply.author?.firstName} {reply.author?.lastName}
                                      </strong>{' '}
                                      {reply.text}
                                    </p>
                                    <button
                                      type="button"
                                      className="_social_login_form_btn_link _btn1"
                                      onClick={() => toggleReplyLike(post._id, comment._id, reply._id)}
                                    >
                                      Like ({reply.likes?.length || 0})
                                    </button>{' '}
                                    <span>
                                      {reply.likes
                                        ?.map((entry) => `${entry.user?.firstName || ''} ${entry.user?.lastName || ''}`.trim())
                                        .filter(Boolean)
                                        .join(', ')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_right_sidebar_wrap">
                  <div className="_layout_right_sidebar_inner">
                    <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_title5">Welcome, {firstName}</h4>
                      <p>Your personalized social feed is ready.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
