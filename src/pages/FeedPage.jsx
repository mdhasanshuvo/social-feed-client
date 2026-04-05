import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const storyCards = [
  { name: 'Your Story', image: '/assets/images/card_ppl1.png', variant: 'create' },
  { name: 'Ryan Roslansky', image: '/assets/images/card_ppl2.png', variant: 'active' },
  { name: 'Ryan Roslansky', image: '/assets/images/card_ppl3.png', variant: 'inactive', mobileHide: true },
  { name: 'Ryan Roslansky', image: '/assets/images/card_ppl4.png', variant: 'inactive', desktopHide: true }
];

const FeedPage = () => {
  const { user, logout } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [postForm, setPostForm] = useState({ text: '', image: '', visibility: 'public' });
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [likesPopup, setLikesPopup] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const profileMenuRef = useRef(null);
  const likesPopupRef = useRef(null);

  const firstName = useMemo(() => user?.firstName || 'Dylan', [user]);
  const fullName = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    return 'Dylan Field';
  }, [user]);

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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }

      if (!likesPopupRef.current?.contains(event.target)) {
        setLikesPopup(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (!postForm.text.trim()) {
      return;
    }

    try {
      const payload = {
        text: postForm.text,
        visibility: postForm.visibility
      };

      if (postForm.image.trim()) {
        payload.image = postForm.image.trim();
      }

      await api.post('/posts', payload);
      setPostForm({ text: '', image: '', visibility: 'public' });
      await fetchFeed();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create post');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsUploadingImage(true);
      setError('');

      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/posts/upload-image', formData);
      const imageUrl = response.data?.data?.imageUrl;

      if (!imageUrl) {
        throw new Error('No image URL returned');
      }

      setPostForm((prev) => ({ ...prev, image: imageUrl }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload image');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const getLikeUsers = (likes = []) => {
    return likes
      .map((item) => `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim())
      .filter(Boolean)
      .filter((name, index, allNames) => allNames.indexOf(name) === index);
  };

  const openLikesPopup = (event, title, likes = []) => {
    const users = getLikeUsers(likes);
    if (!users.length) {
      return;
    }

    const popupWidth = 260;
    const rect = event.currentTarget.getBoundingClientRect();
    const left = Math.min(window.innerWidth - popupWidth - 12, Math.max(12, rect.left));
    const top = Math.min(window.innerHeight - 220, rect.bottom + 10);

    setLikesPopup({
      title,
      users,
      left,
      top
    });
  };

  const formatRelativeTime = (dateValue) => {
    if (!dateValue) {
      return 'just now';
    }

    const now = Date.now();
    const value = new Date(dateValue).getTime();
    const diffMs = Math.max(0, now - value);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) {
      return 'just now';
    }

    if (diffMs < hour) {
      return `${Math.floor(diffMs / minute)}m`;
    }

    if (diffMs < day) {
      return `${Math.floor(diffMs / hour)}h`;
    }

    return `${Math.floor(diffMs / day)}d`;
  };

  const focusReplyInput = (replyKey) => {
    const input = document.getElementById(`reply-input-${replyKey}`);
    input?.focus();
  };

  const draftText = postForm.text.trim();
  const hasDraftPreview = Boolean(draftText || postForm.image);

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
      <div className="_layout_mode_swithing_btn">
        <button type="button" className="_layout_swithing_btn_link" aria-label="Theme toggle" onClick={() => {}}>
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round" />
          </div>
          <div className="_layout_change_btn_ic1">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="16" fill="none" viewBox="0 0 11 16">
              <path fill="#fff" d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997zm-.261-1.83A6.498 6.498 0 005.792 7h1a7.498 7.498 0 01-3.791 6.52l-.495-.87zM5.792 7a6.493 6.493 0 00-2.841-5.374L3.514.8A7.493 7.493 0 016.792 7h-1zm-3.105 8.476c-.528-.042-.985-.077-1.314-.155-.316-.075-.746-.242-.854-.726l.977-.217c-.028-.124-.145-.09.106-.03.237.056.6.086 1.165.131l-.08.997zm.314-1.956c-.622.354-1.045.596-1.31.792a.967.967 0 00-.204.185c-.01.013.027-.038.009-.12l-.977.218a.836.836 0 01.144-.666c.112-.162.27-.3.433-.42.324-.24.814-.519 1.41-.858L3 13.52zM3.292 1.5a.391.391 0 00.374-.285A.382.382 0 003.514.8l-.563.826A.618.618 0 012.702.95a.609.609 0 01.59-.45v1z" />
            </svg>
          </div>
          <div className="_layout_change_btn_ic2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4.389" stroke="#fff" transform="rotate(-90 12 12)" />
              <path stroke="#fff" strokeLinecap="round" d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05" />
            </svg>
          </div>
        </button>
      </div>

      <div className="_main_layout">
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
          <div className="container _custom_container">
            <div className="_logo_wrap">
              <a className="navbar-brand" href="/feed">
                <img src="/assets/images/logo.svg" alt="Image" className="_nav_logo" />
              </a>
            </div>
            <button className="navbar-toggler bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <div className="_header_form ms-auto">
                <form className="_header_form_grp">
                  <svg className="_header_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                    <circle cx="7" cy="7" r="6" stroke="#666" />
                    <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
                  </svg>
                  <input className="form-control me-2 _inpt1" type="search" placeholder="input search text" aria-label="Search" />
                </form>
              </div>
              <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
                <li className="nav-item _header_nav_item">
                  <a className="nav-link _header_nav_link_active _header_nav_link" aria-current="page" href="/feed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" fill="none" viewBox="0 0 18 21">
                      <path className="_home_active" stroke="#000" strokeWidth="1.5" strokeOpacity=".6" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
                      <path className="_home_active" stroke="#000" strokeOpacity=".6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.857 19.341v-5.857a1 1 0 00-1-1H7.143a1 1 0 00-1 1v5.857" />
                    </svg>
                  </a>
                </li>
              </ul>
              <div className="_header_nav_profile sf-profile-menu" ref={profileMenuRef}>
                <div className="_header_nav_profile_image">
                  <img src="/assets/images/profile.png" alt="Image" className="_nav_profile_img" />
                </div>
                <div className="_header_nav_dropdown">
                  <button
                    id="_profile_drop_show_btn"
                    className="sf-profile-trigger"
                    type="button"
                    onClick={() => setProfileMenuOpen((value) => !value)}
                    aria-expanded={profileMenuOpen}
                    aria-label="Open profile menu"
                  >
                    <span className="_header_nav_para">{fullName}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                      <path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
                    </svg>
                  </button>
                </div>
                <div id="_prfoile_drop" className={`_nav_profile_dropdown _profile_dropdown ${profileMenuOpen ? 'show' : ''}`}>
                  <div className="_nav_profile_dropdown_info sf-profile-dropdown-inner">
                    <div className="_nav_profile_dropdown_image sf-profile-dropdown-avatar">
                      <img src="/assets/images/profile.png" alt="Profile" className="_nav_drop_img" />
                    </div>
                    <div className="_nav_profile_dropdown_info_txt">
                      <h4 className="_nav_dropdown_title">{fullName}</h4>
                      <p className="sf-profile-dropdown-subtitle">Account settings</p>
                      <button
                        type="button"
                        className="_nav_drop_profile sf-profile-logout"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="_header_mobile_menu">
          <div className="_header_mobile_menu_wrap">
            <div className="container">
              <div className="_header_mobile_menu">
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_header_mobile_menu_top_inner">
                      <div className="_header_mobile_menu_logo">
                        <a href="/feed" className="_mobile_logo_link">
                          <img src="/assets/images/logo.svg" alt="Image" className="_nav_logo" />
                        </a>
                      </div>
                      <div className="_header_mobile_menu_right">
                        <form className="_header_form_grp">
                          <a href="#0" className="_header_mobile_search">
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                              <circle cx="7" cy="7" r="6" stroke="#666" />
                              <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
                            </svg>
                          </a>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
                      <ul className="_left_inner_area_explore_list">
                        <li className="_left_inner_area_explore_item _explore_item"><span className="_left_inner_area_explore_link">Learning</span> <span className="_left_inner_area_explore_link_txt">New</span></li>
                        <li className="_left_inner_area_explore_item"><span className="_left_inner_area_explore_link">Insights</span></li>
                        <li className="_left_inner_area_explore_item"><span className="_left_inner_area_explore_link">Find friends</span></li>
                        <li className="_left_inner_area_explore_item"><span className="_left_inner_area_explore_link">Bookmarks</span></li>
                        <li className="_left_inner_area_explore_item"><span className="_left_inner_area_explore_link">Group</span></li>
                        <li className="_left_inner_area_explore_item _explore_item"><span className="_left_inner_area_explore_link">Gaming</span> <span className="_left_inner_area_explore_link_txt">New</span></li>
                        <li className="_left_inner_area_explore_item"><span className="_left_inner_area_explore_link">Settings</span></li>
                        <li className="_left_inner_area_explore_item"><span className="_left_inner_area_explore_link">Save post</span></li>
                      </ul>
                    </div>
                  </div>
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_left_inner_event_content">
                        <h4 className="_left_inner_event_title _title5">Events</h4>
                        <a href="#0" className="_left_inner_event_link">See all</a>
                      </div>
                      <a className="_left_inner_event_card_link" href="#0">
                        <div className="_left_inner_event_card">
                          <div className="_left_inner_event_card_iamge"><img src="/assets/images/feed_event1.png" alt="Image" className="_card_img" /></div>
                          <div className="_left_inner_event_card_content">
                            <div className="_left_inner_card_date"><p className="_left_inner_card_date_para">10</p><p className="_left_inner_card_date_para1">Jul</p></div>
                            <div className="_left_inner_card_txt"><h4 className="_left_inner_event_card_title">No more terrorism no more cry</h4></div>
                          </div>
                          <hr className="_underline" />
                          <div className="_left_inner_event_bottom"><p className="_left_iner_event_bottom">17 People Going</p> <span className="_left_iner_event_bottom_link">Going</span></div>
                        </div>
                      </a>
                      <a className="_left_inner_event_card_link" href="#0">
                        <div className="_left_inner_event_card">
                          <div className="_left_inner_event_card_iamge"><img src="/assets/images/feed_event1.png" alt="Image" className="_card_img" /></div>
                          <div className="_left_inner_event_card_content">
                            <div className="_left_inner_card_date"><p className="_left_inner_card_date_para">10</p><p className="_left_inner_card_date_para1">Jul</p></div>
                            <div className="_left_inner_card_txt"><h4 className="_left_inner_event_card_title">No more terrorism no more cry</h4></div>
                          </div>
                          <hr className="_underline" />
                          <div className="_left_inner_event_bottom"><p className="_left_iner_event_bottom">17 People Going</p> <span className="_left_iner_event_bottom_link">Going</span></div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap" id="timeline">
                  <div className="_layout_middle_inner">
                    <div className="_feed_inner_ppl_card _mar_b16">
                      <div className="_feed_inner_story_arrow">
                        <button type="button" className="_feed_inner_story_arrow_btn" aria-label="Previous stories">
                          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
                            <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
                          </svg>
                        </button>
                      </div>
                      <div className="row">
                        {storyCards.map((storyCard, index) => (
                          <div key={`${storyCard.name}-${index}`} className={`col-xl-3 col-lg-3 col-md-4 col-sm-4 col ${storyCard.mobileHide ? '_custom_mobile_none' : ''} ${storyCard.desktopHide ? '_custom_none' : ''}`}>
                            {storyCard.variant === 'create' ? (
                              <div className="_feed_inner_profile_story _b_radious6">
                                <div className="_feed_inner_profile_story_image">
                                  <img src={storyCard.image} alt="Image" className="_profile_story_img" />
                                  <div className="_feed_inner_story_txt">
                                    <div className="_feed_inner_story_btn">
                                      <button className="_feed_inner_story_btn_link" type="button" aria-label="Add story">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                                          <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                                        </svg>
                                      </button>
                                    </div>
                                    <p className="_feed_inner_story_para">{storyCard.name}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="_feed_inner_public_story _b_radious6">
                                <div className="_feed_inner_public_story_image">
                                  <img src={storyCard.image} alt="Image" className="_public_story_img" />
                                  <div className="_feed_inner_pulic_story_txt"><p className="_feed_inner_pulic_story_para">{storyCard.name}</p></div>
                                  <div className="_feed_inner_public_mini"><img src="/assets/images/mini_pic.png" alt="Image" className="_public_mini_img" /></div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="_feed_inner_ppl_card_mobile _mar_b16">
                      <div className="_feed_inner_ppl_card_area">
                        <ul className="_feed_inner_ppl_card_area_list">
                          <li className="_feed_inner_ppl_card_area_item">
                            <a href="#0" className="_feed_inner_ppl_card_area_link">
                              <div className="_feed_inner_ppl_card_area_story">
                                <img src="/assets/images/mobile_story_img.png" alt="Image" className="_card_story_img" />
                                <div className="_feed_inner_ppl_btn"><button className="_feed_inner_ppl_btn_link" type="button"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12"><path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M6 2.5v7M2.5 6h7" /></svg></button></div>
                              </div>
                              <p className="_feed_inner_ppl_card_area_link_txt">Your Story</p>
                            </a>
                          </li>
                          <li className="_feed_inner_ppl_card_area_item"><a href="#0" className="_feed_inner_ppl_card_area_link"><div className="_feed_inner_ppl_card_area_story_active"><img src="/assets/images/mobile_story_img1.png" alt="Image" className="_card_story_img1" /></div><p className="_feed_inner_ppl_card_area_txt">Ryan...</p></a></li>
                          <li className="_feed_inner_ppl_card_area_item"><a href="#0" className="_feed_inner_ppl_card_area_link"><div className="_feed_inner_ppl_card_area_story_inactive"><img src="/assets/images/mobile_story_img2.png" alt="Image" className="_card_story_img1" /></div><p className="_feed_inner_ppl_card_area_txt">Ryan...</p></a></li>
                          <li className="_feed_inner_ppl_card_area_item"><a href="#0" className="_feed_inner_ppl_card_area_link"><div className="_feed_inner_ppl_card_area_story_active"><img src="/assets/images/mobile_story_img1.png" alt="Image" className="_card_story_img1" /></div><p className="_feed_inner_ppl_card_area_txt">Ryan...</p></a></li>
                          <li className="_feed_inner_ppl_card_area_item"><a href="#0" className="_feed_inner_ppl_card_area_link"><div className="_feed_inner_ppl_card_area_story_inactive"><img src="/assets/images/mobile_story_img2.png" alt="Image" className="_card_story_img1" /></div><p className="_feed_inner_ppl_card_area_txt">Ryan...</p></a></li>
                          <li className="_feed_inner_ppl_card_area_item"><a href="#0" className="_feed_inner_ppl_card_area_link"><div className="_feed_inner_ppl_card_area_story_active"><img src="/assets/images/mobile_story_img1.png" alt="Image" className="_card_story_img1" /></div><p className="_feed_inner_ppl_card_area_txt">Ryan...</p></a></li>
                          <li className="_feed_inner_ppl_card_area_item"><a href="#0" className="_feed_inner_ppl_card_area_link"><div className="_feed_inner_ppl_card_area_story"><img src="/assets/images/mobile_story_img.png" alt="Image" className="_card_story_img" /></div><p className="_feed_inner_ppl_card_area_txt">Ryan...</p></a></li>
                          <li className="_feed_inner_ppl_card_area_item"><a href="#0" className="_feed_inner_ppl_card_area_link"><div className="_feed_inner_ppl_card_area_story_active"><img src="/assets/images/mobile_story_img1.png" alt="Image" className="_card_story_img1" /></div><p className="_feed_inner_ppl_card_area_txt">Ryan...</p></a></li>
                        </ul>
                      </div>
                    </div>

                    <form className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16" onSubmit={handleCreatePost}>
                      <div className="_feed_inner_text_area_box">
                        <div className="_feed_inner_text_area_box_image">
                          <img src="/assets/images/txt_img.png" alt="Image" className="_txt_img" />
                        </div>
                        <div className="form-floating _feed_inner_text_area_box_form">
                          <textarea
                            className="form-control _textarea"
                            placeholder="Leave a comment here"
                            id="floatingTextarea"
                            value={postForm.text}
                            onChange={(e) => setPostForm((prev) => ({ ...prev, text: e.target.value }))}
                          />
                          <label className="_feed_textarea_label" htmlFor="floatingTextarea">Write something ...</label>
                        </div>
                      </div>
                      {hasDraftPreview ? (
                        <div className="sf-post-preview">
                          <div className="sf-post-preview-head">
                            <div className="sf-post-preview-author">
                              <img src="/assets/images/post_img.png" alt="Preview author" />
                              <div>
                                <h5>{fullName}</h5>
                                <p>{postForm.visibility === 'private' ? 'Private audience' : 'Public audience'}</p>
                              </div>
                            </div>
                            {postForm.image ? (
                              <button type="button" className="sf-post-preview-remove" onClick={() => setPostForm((prev) => ({ ...prev, image: '' }))}>
                                Remove image
                              </button>
                            ) : null}
                          </div>
                          {draftText ? <p className="sf-post-preview-text">{draftText}</p> : null}
                          {postForm.image ? (
                            <div className="sf-post-preview-media">
                              <img src={postForm.image} alt="Uploaded preview" />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="_feed_inner_text_area_bottom">
                        <div className="sf-composer-photo-wrap">
                          <button
                            type="button"
                            className="sf-composer-photo-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                          >
                            <span>{isUploadingImage ? 'Uploading image...' : postForm.image ? 'Change image' : 'Add image'}</span>
                          </button>
                        </div>
                        <div className="sf-post-composer-controls">
                          <select
                            value={postForm.visibility}
                            onChange={(e) => setPostForm((prev) => ({ ...prev, visibility: e.target.value }))}
                            className="sf-visibility-select"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </select>
                          <div className="_feed_inner_text_area_btn"><button type="submit" className="_feed_inner_text_area_btn_link" disabled={isUploadingImage}><span>Post</span></button></div>
                        </div>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </form>

                    {loading ? <p>Loading feed...</p> : null}
                    {error ? <p style={{ color: '#ff4d4f' }}>{error}</p> : null}

                    {posts.map((post) => {
                      const authorName = `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Unknown User';

                      return (
                        <div key={post._id} className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
                          <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                            <div className="_feed_inner_timeline_post_top">
                              <div className="_feed_inner_timeline_post_box">
                                <div className="_feed_inner_timeline_post_box_image">
                                  <img src="/assets/images/post_img.png" alt="" className="_post_img" />
                                </div>
                                <div className="_feed_inner_timeline_post_box_txt">
                                  <h4 className="_feed_inner_timeline_post_box_title">{authorName}</h4>
                                  <p className="_feed_inner_timeline_post_box_para">{new Date(post.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} ago . <span>{post.visibility}</span></p>
                                </div>
                              </div>
                            </div>
                            <h4 className="_feed_inner_timeline_post_title">{post.text}</h4>
                            {post.image ? (
                              <div className="_feed_inner_timeline_image">
                                <img src={post.image} alt="timeline" className="_time_img" />
                              </div>
                            ) : null}
                          </div>

                          <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
                            <button
                              type="button"
                              className="_feed_inner_timeline_total_reacts_image sf-like-trigger"
                              onClick={(event) => openLikesPopup(event, 'Post likes', post.likes || [])}
                            >
                              <img src="/assets/images/react_img1.png" alt="Image" className="_react_img1" />
                              <img src="/assets/images/react_img2.png" alt="Image" className="_react_img" />
                              <img src="/assets/images/react_img3.png" alt="Image" className="_react_img _rect_img_mbl_none" />
                              <img src="/assets/images/react_img4.png" alt="Image" className="_react_img _rect_img_mbl_none" />
                              <img src="/assets/images/react_img5.png" alt="Image" className="_react_img _rect_img_mbl_none" />
                              <p className="_feed_inner_timeline_total_reacts_para">{post.likes?.length || 0}+</p>
                            </button>
                            <div className="_feed_inner_timeline_total_reacts_txt">
                              <p className="_feed_inner_timeline_total_reacts_para1"><span>{post.comments?.length || 0}</span> Comment</p>
                            </div>
                          </div>

                          <div className="_feed_inner_timeline_reaction">
                            <button type="button" className="_feed_inner_timeline_reaction_emoji _feed_reaction _feed_reaction_active" onClick={() => togglePostLike(post._id)}>
                              <span className="_feed_inner_timeline_reaction_link"><span>Like</span></span>
                            </button>
                            <button type="button" className="_feed_inner_timeline_reaction_comment _feed_reaction"><span className="_feed_inner_timeline_reaction_link"><span>Comment</span></span></button>
                          </div>

                          <div className="_feed_inner_timeline_cooment_area">
                            {(post.comments || []).map((comment) => {
                              const commentId = comment.id || comment._id;
                              const replyKey = `${post._id}:${commentId}`;
                              const commentLikeCount = comment.likes?.length || 0;

                              return (
                                <div key={commentId} className="sf-comment-thread">
                                  <div className="sf-comment-row">
                                    <img src="/assets/images/comment_img.png" alt="Comment avatar" className="sf-comment-avatar" />
                                    <div className="sf-comment-main">
                                      <div className="sf-comment-bubble">
                                        <h5 className="sf-comment-name">{comment.author?.firstName} {comment.author?.lastName}</h5>
                                        <p className="sf-comment-text">{comment.text}</p>
                                      </div>
                                      <div className="sf-comment-actions">
                                        <button type="button" onClick={() => toggleCommentLike(post._id, commentId)}>Like</button>
                                        <button type="button" onClick={() => focusReplyInput(replyKey)}>Reply</button>
                                        <span className="sf-comment-time">.{formatRelativeTime(comment.createdAt)}</span>
                                      </div>
                                      {commentLikeCount > 0 ? (
                                        <button
                                          type="button"
                                          className="sf-comment-reactions sf-like-trigger"
                                          onClick={(event) => openLikesPopup(event, 'Comment likes', comment.likes || [])}
                                        >
                                          <span>👍</span>
                                          <strong>{commentLikeCount}</strong>
                                        </button>
                                      ) : null}

                                      <div className="sf-reply-list">
                                        {(comment.replies || []).map((reply) => {
                                          return (
                                          <div key={reply._id} className="sf-reply-item">
                                            <div className="sf-reply-head">
                                              <h6>{reply.author?.firstName} {reply.author?.lastName}</h6>
                                              <span>{formatRelativeTime(reply.createdAt)}</span>
                                            </div>
                                            <p>{reply.text}</p>
                                            <div className="sf-reply-actions">
                                              <button type="button" className="sf-reply-like" onClick={() => toggleReplyLike(post._id, commentId, reply._id)}>
                                                Like
                                              </button>
                                              {reply.likes?.length ? (
                                                <button
                                                  type="button"
                                                  className="sf-reply-likes-chip sf-like-trigger"
                                                  onClick={(event) => openLikesPopup(event, 'Reply likes', reply.likes || [])}
                                                >
                                                  👍 {reply.likes.length}
                                                </button>
                                              ) : null}
                                            </div>
                                          </div>
                                          );
                                        })}
                                      </div>

                                      <div className="sf-reply-input-row">
                                        <input
                                          id={`reply-input-${replyKey}`}
                                          type="text"
                                          className="form-control _social_login_input"
                                          placeholder="Write a reply"
                                          value={replyInputs[replyKey] || ''}
                                          onChange={(e) => setReplyInputs((prev) => ({ ...prev, [replyKey]: e.target.value }))}
                                        />
                                        <button type="button" className="sf-reply-send" onClick={() => addReply(post._id, commentId)}>
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            <form className="sf-comment-input-wrap" onSubmit={(event) => event.preventDefault()}>
                              <img src="/assets/images/comment_img.png" alt="Your avatar" className="sf-comment-input-avatar" />
                              <div className="sf-comment-input-shell">
                                <input
                                  type="text"
                                  className="sf-comment-input"
                                  placeholder="Write a comment"
                                  value={commentInputs[post._id] || ''}
                                  onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))}
                                />
                                <button type="button" className="sf-comment-submit" onClick={() => addComment(post._id)}>
                                  Comment
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      );
                    })}
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
                    <div className="_left_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area" style={{ marginTop: '16px' }}>
                      <div className="_left_inner_event_content">
                        <h4 className="_left_inner_event_title _title5">Quick Actions</h4>
                        <span className="_left_inner_event_link">Active</span>
                      </div>
                      <p className="_left_iner_event_bottom">Public and private posts are filtered automatically.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {likesPopup ? (
        <div className="sf-likes-popup" ref={likesPopupRef} style={{ top: likesPopup.top, left: likesPopup.left }}>
          <div className="sf-likes-popup-head">
            <h5>{likesPopup.title}</h5>
            <button type="button" onClick={() => setLikesPopup(null)} aria-label="Close likes popup">×</button>
          </div>
          <ul className="sf-likes-popup-list">
            {likesPopup.users.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default FeedPage;
