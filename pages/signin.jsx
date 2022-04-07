import Link from 'next/link';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import * as Yup from 'yup';
import Image from 'next/image';
import {
  GoogleReCaptchaProvider,
  GoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import axios from 'axios';
import bcryptjs from 'bcryptjs';

const initialValues = {
  username: '',
  password: '',
};

const SigninFormSchema = Yup.object().shape({
  username: Yup.string().required('Usename is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

function Signin() {
  const [errorMessage, setErrorMessage] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);

  const handleSubmit = async fields => {
    const result = await axios.post('/api/accounts/auth', {
      username: fields.username,
      password: fields.password,
    });
    if (result.data.message) {
      setErrorMessage(result.data.message);
    }
  };

  const handleReCaptchaVerify = async token => {
    if (!token) {
      return;
    }
    setIsValidToken(true);
  };

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY}
    >
      <GoogleReCaptcha onVerify={token => handleReCaptchaVerify(token)} />
      {isValidToken && (
        <>
          <div className="container">
            <div className="row justify-content-center align-items-center mt-4">
              <div className="col-xl-5 col-md-6">
                <div className="mini-logo text-center">
                  <Link href="/">
                    <a>
                      <Image
                        src="/images/logo.png"
                        height={86}
                        width={200}
                        alt="Logo"
                      />
                    </a>
                  </Link>
                  <h4 className="card-title mb-1">Sign Up</h4>
                  {errorMessage && (
                    <h5 className="text-danger">{errorMessage}</h5>
                  )}
                </div>
                <div className="auth-form card">
                  <div className="card-body">
                    <Formik
                      initialValues={initialValues}
                      validationSchema={SigninFormSchema}
                      onSubmit={async fields => {
                        await handleSubmit(fields);
                      }}
                    >
                      {({ errors, touched, isSubmitting, isValid }) => (
                        <Form>
                          <div className="row">
                            <div className="col-12 mb-3">
                              <label className="form-label" htmlFor="username">
                                Usename
                              </label>
                              <Field
                                id="username"
                                name="username"
                                type="text"
                                className={`form-control${
                                  errors.username && touched.username
                                    ? ' is-invalid'
                                    : ''
                                }`}
                              />
                              <ErrorMessage
                                name="username"
                                component="div"
                                className="invalid-feedback"
                              />
                            </div>

                            <div className="col-12 mb-3">
                              <label className="form-label" htmlFor="password">
                                Password
                              </label>
                              <Field
                                id="password"
                                name="password"
                                type="password"
                                className={`form-control${
                                  errors.password && touched.password
                                    ? ' is-invalid'
                                    : ''
                                }`}
                              />
                              <ErrorMessage
                                name="password"
                                component="div"
                                className="invalid-feedback"
                              />
                            </div>
                            <div className="col-6">
                              <div className="form-check">
                                <Field
                                  id="acceptTerms"
                                  type="checkbox"
                                  name="acceptTerms"
                                  className="form-check-input "
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="acceptTerms"
                                >
                                  Remember me
                                </label>
                              </div>
                            </div>
                            <div className="col-6 text-end">
                              <Link href="/reset">
                                <a>Forgot Password?</a>
                              </Link>
                            </div>
                          </div>

                          <div className="mt-3 d-grid gap-2">
                            <button
                              type="submit"
                              className="btn btn-primary mr-2"
                              disabled={!isValid || isSubmitting}
                            >
                              {isSubmitting ? 'Loading..' : `Sign In`}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </GoogleReCaptchaProvider>
  );
}
export default Signin;
