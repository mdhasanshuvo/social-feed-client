import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      setLoading(true);
      const response = await api.post('/auth/login', formData);
      login(response.data.data);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
      <div className="_shape_one">
        <img src="/assets/images/shape1.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src="/assets/images/shape2.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape1.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <img src="/assets/images/shape3.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape2.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_social_login_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_login_left">
                <div className="_social_login_left_image">
                  <img src="/assets/images/login.png" alt="Image" className="_left_img" />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_login_content">
                <div className="_social_login_left_logo _mar_b28">
                  <img src="/assets/images/logo.svg" alt="Image" className="_left_logo" />
                </div>
                <p className="_social_login_content_para _mar_b8">Welcome back</p>
                <h4 className="_social_login_content_title _titl4 _mar_b50">Login to your account</h4>
                <button type="button" className="_social_login_content_btn _mar_b40" disabled>
                  <img src="/assets/images/google.svg" alt="Image" className="_google_img" />
                  <span>Or sign-in with google</span>
                </button>
                <div className="_social_login_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>
                <form className="_social_login_form" onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control _social_login_input"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-control _social_login_input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                      <div className="form-check _social_login_form_check">
                        <input className="form-check-input _social_login_form_check_input" type="radio" defaultChecked />
                        <label className="form-check-label _social_login_form_check_label">Remember me</label>
                      </div>
                    </div>
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                      <div className="_social_login_form_left">
                        <p className="_social_login_form_left_para">Forgot password?</p>
                      </div>
                    </div>
                  </div>
                  {error ? (
                    <div className="row">
                      <div className="col-12">
                        <p style={{ color: '#ff4d4f', marginTop: '8px' }}>{error}</p>
                      </div>
                    </div>
                  ) : null}
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_login_form_btn _mar_t40 _mar_b60">
                        <button type="submit" className="_social_login_form_btn_link _btn1" disabled={loading}>
                          {loading ? 'Logging in...' : 'Login now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_login_bottom_txt">
                      <p className="_social_login_bottom_txt_para">
                        Dont have an account? <Link to="/register">Create New Account</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
