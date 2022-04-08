import Link from 'next/link';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';
import Image from 'next/image';
import {
  GoogleReCaptchaProvider,
  GoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useRouter } from 'next/router';
import { signIn, getCsrfToken, getSession } from 'next-auth/react';

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

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

function Signin({ csrfToken }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);

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
                      onSubmit={async (fields, { setSubmitting }) => {
                        const res = await signIn('credentials', {
                          redirect: false,
                          username: fields.username,
                          password: fields.password,
                          callbackUrl: `${window.location.origin}`,
                        });
                        if (res.error) {
                          setErrorMessage(res.error);
                        } else {
                          setErrorMessage(null);
                        }
                        if (res.url) router.push(res.url);
                        setSubmitting(false);
                      }}
                    >
                      {({ errors, touched, isSubmitting, isValid }) => (
                        <Form>
                          <input
                            name="csrfToken"
                            type="hidden"
                            defaultValue={csrfToken}
                          />
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
                            <div className="col-12 text-end">
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
