import { useEffect, useMemo, useState } from 'react';
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
  const [timelineMenuOpen, setTimelineMenuOpen] = useState(false);

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
                <li className="nav-item _header_nav_item">
                  <a className="nav-link _header_nav_link" aria-current="page" href="#suggested">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="20" fill="none" viewBox="0 0 26 20">
                      <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M12.79 12.15h.429c2.268.015 7.45.243 7.45 3.732 0 3.466-5.002 3.692-7.415 3.707h-.894c-2.268-.015-7.452-.243-7.452-3.727 0-3.47 5.184-3.697 7.452-3.711l.297-.001h.132zm0 1.75c-2.792 0-6.12.34-6.12 1.962 0 1.585 3.13 1.955 5.864 1.976l.255.002c2.792 0 6.118-.34 6.118-1.958 0-1.638-3.326-1.982-6.118-1.982zm9.343-2.224c2.846.424 3.444 1.751 3.444 2.79 0 .636-.251 1.794-1.931 2.43a.882.882 0 01-1.137-.506.873.873 0 01.51-1.13c.796-.3.796-.633.796-.793 0-.511-.654-.868-1.944-1.06a.878.878 0 01-.741-.996.886.886 0 011.003-.735zm-17.685.735a.878.878 0 01-.742.997c-1.29.19-1.944.548-1.944 1.059 0 .16 0 .491.798.793a.873.873 0 01-.314 1.693.897.897 0 01-.313-.057C.25 16.259 0 15.1 0 14.466c0-1.037.598-2.366 3.446-2.79.485-.06.929.257 1.002.735zM12.789 0c2.96 0 5.368 2.392 5.368 5.33 0 2.94-2.407 5.331-5.368 5.331h-.031a5.329 5.329 0 01-3.782-1.57 5.253 5.253 0 01-1.553-3.764C7.423 2.392 9.83 0 12.789 0zm0 1.75c-1.987 0-3.604 1.607-3.604 3.58a3.526 3.526 0 001.04 2.527 3.58 3.58 0 002.535 1.054l.03.875v-.875c1.987 0 3.605-1.605 3.605-3.58S14.777 1.75 12.789 1.75zm7.27-.607a4.222 4.222 0 013.566 4.172c-.004 2.094-1.58 3.89-3.665 4.181a.88.88 0 01-.994-.745.875.875 0 01.75-.989 2.494 2.494 0 002.147-2.45 2.473 2.473 0 00-2.09-2.443.876.876 0 01-.726-1.005.881.881 0 011.013-.721zm-13.528.72a.876.876 0 01-.726 1.006 2.474 2.474 0 00-2.09 2.446A2.493 2.493 0 005.86 7.762a.875.875 0 11-.243 1.734c-2.085-.29-3.66-2.087-3.664-4.179 0-2.082 1.5-3.837 3.566-4.174a.876.876 0 011.012.72z" clipRule="evenodd" />
                    </svg>
                  </a>
                </li>
                <li className="nav-item _header_nav_item">
                  <span id="_notify_btn" className="nav-link _header_nav_link _header_notify_btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" fill="none" viewBox="0 0 20 22">
                      <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z" clipRule="evenodd" />
                    </svg>
                    <span className="_counting">6</span>
                  </span>
                </li>
                <li className="nav-item _header_nav_item">
                  <a className="nav-link _header_nav_link" aria-current="page" href="#timeline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="22" fill="none" viewBox="0 0 23 22">
                      <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M11.43 0c2.96 0 5.743 1.143 7.833 3.22 4.32 4.29 4.32 11.271 0 15.562C17.145 20.886 14.293 22 11.405 22c-1.575 0-3.16-.33-4.643-1.012-.437-.174-.847-.338-1.14-.338-.338.002-.793.158-1.232.308-.9.307-2.022.69-2.852-.131-.826-.822-.445-1.932-.138-2.826.152-.44.307-.895.307-1.239 0-.282-.137-.642-.347-1.161C-.57 11.46.322 6.47 3.596 3.22A11.04 11.04 0 0111.43 0zm0 1.535A9.5 9.5 0 004.69 4.307a9.463 9.463 0 00-1.91 10.686c.241.592.474 1.17.474 1.77 0 .598-.207 1.201-.39 1.733-.15.439-.378 1.1-.231 1.245.143.147.813-.085 1.255-.235.53-.18 1.133-.387 1.73-.391.597 0 1.161.225 1.758.463 3.655 1.679 7.98.915 10.796-1.881 3.716-3.693 3.716-9.7 0-13.391a9.5 9.5 0 00-6.74-2.77zm4.068 8.867c.57 0 1.03.458 1.03 1.024 0 .566-.46 1.023-1.03 1.023a1.023 1.023 0 11-.01-2.047h.01zm-4.131 0c.568 0 1.03.458 1.03 1.024 0 .566-.462 1.023-1.03 1.023a1.03 1.03 0 01-1.035-1.024c0-.566.455-1.023 1.025-1.023h.01zm-4.132 0c.568 0 1.03.458 1.03 1.024 0 .566-.462 1.023-1.03 1.023a1.022 1.022 0 11-.01-2.047h.01z" clipRule="evenodd" />
                    </svg>
                    <span className="_counting">2</span>
                  </a>
                </li>
              </ul>
              <div className="_header_nav_profile">
                <div className="_header_nav_profile_image">
                  <img src="/assets/images/profile.png" alt="Image" className="_nav_profile_img" />
                </div>
                <div className="_header_nav_dropdown">
                  <p className="_header_nav_para">{fullName}</p>
                  <button id="_profile_drop_show_btn" className="_header_nav_dropdown_btn _dropdown_toggle" type="button" onClick={() => setTimelineMenuOpen((value) => !value)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                      <path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
                    </svg>
                  </button>
                </div>
                <div id="_prfoile_drop" className={`_nav_profile_dropdown _profile_dropdown ${timelineMenuOpen ? 'show' : ''}`}>
                  <div className="_nav_profile_dropdown_info">
                    <div className="_nav_profile_dropdown_image">
                      <img src="/assets/images/profile.png" alt="Image" className="_nav_drop_img" />
                    </div>
                    <div className="_nav_profile_dropdown_info_txt">
                      <h4 className="_nav_dropdown_title">{fullName}</h4>
                      <button type="button" className="_nav_drop_profile" onClick={logout}>Logout</button>
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

        <div className="_mobile_navigation_bottom_wrapper">
          <div className="_mobile_navigation_bottom_wrap">
            <div className="conatiner">
              <div className="row">
                <div className="col-xl-12 col-lg-12 col-md-12">
                  <ul className="_mobile_navigation_bottom_list">
                    <li className="_mobile_navigation_bottom_item">
                      <a href="/feed" className="_mobile_navigation_bottom_link _mobile_navigation_bottom_link_active">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="27" fill="none" viewBox="0 0 24 27">
                          <path className="_mobile_svg" fill="#000" fillOpacity=".6" stroke="#666666" strokeWidth="1.5" d="M1 13.042c0-2.094 0-3.141.431-4.061.432-.92 1.242-1.602 2.862-2.965l1.571-1.321C8.792 2.232 10.256 1 12 1c1.744 0 3.208 1.232 6.136 3.695l1.572 1.321c1.62 1.363 2.43 2.044 2.86 2.965.432.92.432 1.967.432 4.06v6.54c0 2.908 0 4.362-.92 5.265-.921.904-2.403.904-5.366.904H7.286c-2.963 0-4.445 0-5.365-.904C1 23.944 1 22.49 1 19.581v-6.54z" />
                          <path fill="#fff" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.07 18.497h5.857v7.253H9.07v-7.253z" />
                        </svg>
                      </a>
                    </li>
                    <li className="_mobile_navigation_bottom_item">
                      <a href="#suggested" className="_mobile_navigation_bottom_link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="27" height="20" fill="none" viewBox="0 0 27 20">
                          <path className="_dark_svg" fill="#000" fillOpacity=".6" fillRule="evenodd" d="M13.334 12.405h.138l.31.001c2.364.015 7.768.247 7.768 3.81 0 3.538-5.215 3.769-7.732 3.784h-.932c-2.364-.015-7.77-.247-7.77-3.805 0-3.543 5.405-3.774 7.77-3.789l.31-.001h.138zm0 1.787c-2.91 0-6.38.348-6.38 2.003 0 1.619 3.263 1.997 6.114 2.018l.266.001c2.91 0 6.379-.346 6.379-1.998 0-1.673-3.469-2.024-6.38-2.024zm9.742-2.27c2.967.432 3.59 1.787 3.59 2.849 0 .648-.261 1.83-2.013 2.48a.953.953 0 01-.327.058.919.919 0 01-.858-.575.886.886 0 01.531-1.153c.83-.307.83-.647.83-.81 0-.522-.682-.886-2.027-1.082a.9.9 0 01-.772-1.017c.074-.488.54-.814 1.046-.75zm-18.439.75a.9.9 0 01-.773 1.017c-1.345.196-2.027.56-2.027 1.082 0 .163 0 .501.832.81a.886.886 0 01.531 1.153.92.92 0 01-.858.575.953.953 0 01-.327-.058C.262 16.6 0 15.418 0 14.77c0-1.06.623-2.417 3.592-2.85.506-.061.97.263 1.045.751zM13.334 0c3.086 0 5.596 2.442 5.596 5.442 0 3.001-2.51 5.443-5.596 5.443H13.3a5.616 5.616 0 01-3.943-1.603A5.308 5.308 0 017.74 5.439C7.739 2.442 10.249 0 13.334 0zm0 1.787c-2.072 0-3.758 1.64-3.758 3.655-.003.977.381 1.89 1.085 2.58a3.772 3.772 0 002.642 1.076l.03.894v-.894c2.073 0 3.76-1.639 3.76-3.656 0-2.015-1.687-3.655-3.76-3.655zm7.58-.62c2.153.344 3.717 2.136 3.717 4.26-.004 2.138-1.647 3.972-3.82 4.269a.911.911 0 01-1.036-.761.897.897 0 01.782-1.01c1.273-.173 2.235-1.248 2.237-2.501 0-1.242-.916-2.293-2.179-2.494a.897.897 0 01-.756-1.027.917.917 0 011.055-.736zM6.81 1.903a.897.897 0 01-.757 1.027C4.79 3.13 3.874 4.182 3.874 5.426c.002 1.251.963 2.327 2.236 2.5.503.067.853.519.783 1.008a.912.912 0 01-1.036.762c-2.175-.297-3.816-2.131-3.82-4.267 0-2.126 1.563-3.918 3.717-4.262.515-.079.972.251 1.055.736z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </li>
                    <li className="_mobile_navigation_bottom_item">
                      <a href="#timeline" className="_mobile_navigation_bottom_link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="27" fill="none" viewBox="0 0 25 27">
                          <path className="_dark_svg" fill="#000" fillOpacity=".6" fillRule="evenodd" d="M10.17 23.46c.671.709 1.534 1.098 2.43 1.098.9 0 1.767-.39 2.44-1.099.36-.377.976-.407 1.374-.067.4.34.432.923.073 1.3-1.049 1.101-2.428 1.708-3.886 1.708h-.003c-1.454-.001-2.831-.608-3.875-1.71a.885.885 0 01.072-1.298 1.01 1.01 0 011.374.068zM12.663 0c5.768 0 9.642 4.251 9.642 8.22 0 2.043.549 2.909 1.131 3.827.576.906 1.229 1.935 1.229 3.88-.453 4.97-5.935 5.375-12.002 5.375-6.067 0-11.55-.405-11.998-5.296-.004-2.024.649-3.053 1.225-3.959l.203-.324c.501-.814.928-1.7.928-3.502C3.022 4.25 6.897 0 12.664 0zm0 1.842C8.13 1.842 4.97 5.204 4.97 8.22c0 2.553-.75 3.733-1.41 4.774-.531.836-.95 1.497-.95 2.932.216 2.316 1.831 3.533 10.055 3.533 8.178 0 9.844-1.271 10.06-3.613-.004-1.355-.423-2.016-.954-2.852-.662-1.041-1.41-2.221-1.41-4.774 0-3.017-3.161-6.38-7.696-6.38z" clipRule="evenodd" />
                        </svg>
                        <span className="_counting">6</span>
                      </a>
                    </li>
                    <li className="_mobile_navigation_bottom_item">
                      <a href="#" className="_mobile_navigation_bottom_link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path className="_dark_svg" fill="#000" fillOpacity=".6" fillRule="evenodd" d="M12.002 0c3.208 0 6.223 1.239 8.487 3.489 4.681 4.648 4.681 12.211 0 16.86-2.294 2.28-5.384 3.486-8.514 3.486-1.706 0-3.423-.358-5.03-1.097-.474-.188-.917-.366-1.235-.366-.366.003-.859.171-1.335.334-.976.333-2.19.748-3.09-.142-.895-.89-.482-2.093-.149-3.061.164-.477.333-.97.333-1.342 0-.306-.149-.697-.376-1.259C-1 12.417-.032 7.011 3.516 3.49A11.96 11.96 0 0112.002 0zm.001 1.663a10.293 10.293 0 00-7.304 3.003A10.253 10.253 0 002.63 16.244c.261.642.514 1.267.514 1.917 0 .649-.225 1.302-.422 1.878-.163.475-.41 1.191-.252 1.349.156.16.881-.092 1.36-.255.576-.195 1.228-.42 1.874-.424.648 0 1.259.244 1.905.503 3.96 1.818 8.645.99 11.697-2.039 4.026-4 4.026-10.509 0-14.508a10.294 10.294 0 00-7.303-3.002zm4.407 9.607c.617 0 1.117.495 1.117 1.109 0 .613-.5 1.109-1.117 1.109a1.116 1.116 0 01-1.12-1.11c0-.613.494-1.108 1.11-1.108h.01zm-4.476 0c.616 0 1.117.495 1.117 1.109 0 .613-.5 1.109-1.117 1.109a1.116 1.116 0 01-1.121-1.11c0-.613.493-1.108 1.11-1.108h.01zm-4.477 0c.617 0 1.117.495 1.117 1.109 0 .613-.5 1.109-1.117 1.109a1.116 1.116 0 01-1.12-1.11c0-.613.494-1.108 1.11-1.108h.01z" clipRule="evenodd" />
                        </svg>
                        <span className="_counting">2</span>
                      </a>
                    </li>
                    <div className="_header_mobile_toggle">
                      <button type="button" className="_header_mobile_btn_link" value="go to mobile menu" onClick={logout}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" fill="none" viewBox="0 0 18 14">
                          <path stroke="#666" strokeLinecap="round" strokeWidth="1.5" d="M1 1h16M1 7h16M1 13h16" />
                        </svg>
                      </button>
                    </div>
                  </ul>
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
                  <div className="_layout_left_sidebar_inner" id="suggested">
                    <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_left_inner_area_suggest_content _mar_b24">
                        <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
                        <span className="_left_inner_area_suggest_content_txt"><a className="_left_inner_area_suggest_content_txt_link" href="#0">See All</a></span>
                      </div>
                      <div className="_left_inner_area_suggest_info">
                        <div className="_left_inner_area_suggest_info_box">
                          <div className="_left_inner_area_suggest_info_image"><img src="/assets/images/people1.png" alt="Image" className="_info_img" /></div>
                          <div className="_left_inner_area_suggest_info_txt"><h4 className="_left_inner_area_suggest_info_title">Steve Jobs</h4><p className="_left_inner_area_suggest_info_para">CEO of Apple</p></div>
                        </div>
                        <div className="_left_inner_area_suggest_info_link"><a href="#0" className="_info_link">Connect</a></div>
                      </div>
                      <div className="_left_inner_area_suggest_info">
                        <div className="_left_inner_area_suggest_info_box">
                          <div className="_left_inner_area_suggest_info_image"><img src="/assets/images/people2.png" alt="Image" className="_info_img1" /></div>
                          <div className="_left_inner_area_suggest_info_txt"><h4 className="_left_inner_area_suggest_info_title">Ryan Roslansky</h4><p className="_left_inner_area_suggest_info_para">CEO of Linkedin</p></div>
                        </div>
                        <div className="_left_inner_area_suggest_info_link"><a href="#0" className="_info_link">Connect</a></div>
                      </div>
                      <div className="_left_inner_area_suggest_info">
                        <div className="_left_inner_area_suggest_info_box">
                          <div className="_left_inner_area_suggest_info_image"><img src="/assets/images/people3.png" alt="Image" className="_info_img1" /></div>
                          <div className="_left_inner_area_suggest_info_txt"><h4 className="_left_inner_area_suggest_info_title">Dylan Field</h4><p className="_left_inner_area_suggest_info_para">CEO of Figma</p></div>
                        </div>
                        <div className="_left_inner_area_suggest_info_link"><a href="#0" className="_info_link">Connect</a></div>
                      </div>
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

                    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
                      <div className="_feed_inner_text_area_box">
                        <div className="_feed_inner_text_area_box_image">
                          <img src="/assets/images/txt_img.png" alt="Image" className="_txt_img" />
                        </div>
                        <div className="form-floating _feed_inner_text_area_box_form">
                          <textarea className="form-control _textarea" placeholder="Leave a comment here" id="floatingTextarea" />
                          <label className="_feed_textarea_label" htmlFor="floatingTextarea">Write something ...</label>
                        </div>
                      </div>
                      <div className="_feed_inner_text_area_bottom">
                        <div className="_feed_inner_text_area_item">
                          <div className="_feed_inner_text_area_bottom_photo _feed_common"><button type="button" className="_feed_inner_text_area_bottom_photo_link"><span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">Photo</span></button></div>
                          <div className="_feed_inner_text_area_bottom_video _feed_common"><button type="button" className="_feed_inner_text_area_bottom_photo_link"><span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">Video</span></button></div>
                          <div className="_feed_inner_text_area_bottom_event _feed_common"><button type="button" className="_feed_inner_text_area_bottom_photo_link"><span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">Event</span></button></div>
                          <div className="_feed_inner_text_area_bottom_article _feed_common"><button type="button" className="_feed_inner_text_area_bottom_photo_link"><span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">Article</span></button></div>
                        </div>
                        <div className="_feed_inner_text_area_btn"><button type="button" className="_feed_inner_text_area_btn_link"><span>Post</span></button></div>
                      </div>
                    </div>

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
                              <div className="_feed_inner_timeline_post_box_dropdown">
                                <div className="_feed_timeline_post_dropdown">
                                  <button type="button" id="_timeline_show_drop_btn" className="_feed_timeline_post_dropdown_link" onClick={() => setTimelineMenuOpen((value) => !value)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17"><circle cx="2" cy="2" r="2" fill="#C4C4C4" /><circle cx="2" cy="8" r="2" fill="#C4C4C4" /><circle cx="2" cy="15" r="2" fill="#C4C4C4" /></svg>
                                  </button>
                                </div>
                                <div id="_timeline_drop" className={`_feed_timeline_dropdown _timeline_dropdown ${timelineMenuOpen ? 'show' : ''}`}>
                                  <ul className="_feed_timeline_dropdown_list">
                                    <li className="_feed_timeline_dropdown_item"><button type="button" className="_feed_timeline_dropdown_link"><span>Save Post</span></button></li>
                                    <li className="_feed_timeline_dropdown_item"><button type="button" className="_feed_timeline_dropdown_link"><span>Turn On Notification</span></button></li>
                                    <li className="_feed_timeline_dropdown_item"><button type="button" className="_feed_timeline_dropdown_link"><span>Hide</span></button></li>
                                    <li className="_feed_timeline_dropdown_item"><button type="button" className="_feed_timeline_dropdown_link"><span>Edit Post</span></button></li>
                                    <li className="_feed_timeline_dropdown_item"><button type="button" className="_feed_timeline_dropdown_link"><span>Delete Post</span></button></li>
                                  </ul>
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
                            <div className="_feed_inner_timeline_total_reacts_image">
                              <img src="/assets/images/react_img1.png" alt="Image" className="_react_img1" />
                              <img src="/assets/images/react_img2.png" alt="Image" className="_react_img" />
                              <img src="/assets/images/react_img3.png" alt="Image" className="_react_img _rect_img_mbl_none" />
                              <img src="/assets/images/react_img4.png" alt="Image" className="_react_img _rect_img_mbl_none" />
                              <img src="/assets/images/react_img5.png" alt="Image" className="_react_img _rect_img_mbl_none" />
                              <p className="_feed_inner_timeline_total_reacts_para">{post.likes?.length || 0}+</p>
                            </div>
                            <div className="_feed_inner_timeline_total_reacts_txt">
                              <p className="_feed_inner_timeline_total_reacts_para1"><span>{post.comments?.length || 0}</span> Comment</p>
                              <p className="_feed_inner_timeline_total_reacts_para2"><span>{Math.max(0, (post.likes?.length || 0) - 1)}</span> Share</p>
                            </div>
                          </div>

                          <div className="_feed_inner_timeline_reaction">
                            <button type="button" className="_feed_inner_timeline_reaction_emoji _feed_reaction _feed_reaction_active" onClick={() => togglePostLike(post._id)}>
                              <span className="_feed_inner_timeline_reaction_link"><span>Like</span></span>
                            </button>
                            <button type="button" className="_feed_inner_timeline_reaction_comment _feed_reaction"><span className="_feed_inner_timeline_reaction_link"><span>Comment</span></span></button>
                            <button type="button" className="_feed_inner_timeline_reaction_share _feed_reaction"><span className="_feed_inner_timeline_reaction_link"><span>Share</span></span></button>
                          </div>

                          <div className="_feed_inner_timeline_cooment_area">
                            <div className="_feed_inner_comment_box">
                              <form className="_feed_inner_comment_box_form" onSubmit={(event) => event.preventDefault()}>
                                <div className="_feed_inner_comment_box_content">
                                  <div className="_feed_inner_comment_box_content_image"><img src="/assets/images/comment_img.png" alt="" className="_comment_img" /></div>
                                  <div className="_feed_inner_comment_box_content_txt">
                                    <textarea className="form-control _comment_textarea" placeholder="Write a comment" value={commentInputs[post._id] || ''} onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))} />
                                  </div>
                                </div>
                                <div className="_feed_inner_comment_box_icon">
                                  <button type="button" className="_feed_inner_comment_box_icon_btn" onClick={() => addComment(post._id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z" clipRule="evenodd" /></svg>
                                  </button>
                                </div>
                              </form>
                            </div>

                            {(post.comments || []).map((comment) => {
                              const commentId = comment.id || comment._id;
                              const replyKey = `${post._id}:${commentId}`;

                              return (
                                <div key={commentId} className="_feed_inner_comment_box" style={{ marginTop: '12px' }}>
                                  <div className="_feed_inner_comment_box_form">
                                    <div className="_feed_inner_comment_box_content">
                                      <div className="_feed_inner_comment_box_content_image"><img src="/assets/images/comment_img.png" alt="" className="_comment_img" /></div>
                                      <div className="_feed_inner_comment_box_content_txt" style={{ width: '100%' }}>
                                        <div className="d-flex justify-content-between align-items-start gap-3">
                                          <p><strong>{comment.author?.firstName} {comment.author?.lastName}</strong> {comment.text}</p>
                                          <button type="button" className="_feed_inner_comment_box_icon_btn" onClick={() => toggleCommentLike(post._id, commentId)}>Like ({comment.likes?.length || 0})</button>
                                        </div>
                                        <div className="d-flex flex-column gap-2 _mar_t8">
                                          {(comment.replies || []).map((reply) => (
                                            <div key={reply._id} style={{ marginLeft: '20px' }}>
                                              <p><strong>{reply.author?.firstName} {reply.author?.lastName}</strong> {reply.text}</p>
                                              <button type="button" className="_feed_inner_comment_box_icon_btn" onClick={() => toggleReplyLike(post._id, commentId, reply._id)}>Like ({reply.likes?.length || 0})</button>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="row _mar_t8">
                                          <div className="col-9"><input type="text" className="form-control _social_login_input" placeholder="Reply" value={replyInputs[replyKey] || ''} onChange={(e) => setReplyInputs((prev) => ({ ...prev, [replyKey]: e.target.value }))} /></div>
                                          <div className="col-3"><button type="button" className="_feed_inner_comment_box_icon_btn" onClick={() => addReply(post._id, commentId)}>Reply</button></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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
    </div>
  );
};

export default FeedPage;
