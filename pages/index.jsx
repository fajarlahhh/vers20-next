import Image from 'next/image';
import {
  GoogleReCaptchaProvider,
  GoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import axios from 'axios';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import Link from 'next/link';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import Web3 from 'web3';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { v4 as uuid } from 'uuid';
import bcryptjs from 'bcryptjs';

export default function App() {
  const router = useRouter();
  const [referral, setReferral] = useState(router.query.ref);
  const [state, dispatch] = useReducer(reducer, initialState);
  let { provider, web3Provider, address } = state;
  const [contracts, setContracts] = useState([]);
  const [account, setAccount] = useState({
    id: '',
    username: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [progress, setProgress] = useState('');
  const contractAbi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'Approval',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: '_owner',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
      ],
      name: 'allowance',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'approve',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'decimals',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'getOwner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'name',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'symbol',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'totalSupply',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'transfer',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'transferFrom',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;
  const aviorContract = process.env.NEXT_PUBLIC_AVIOR_CONTRACT;
  const aviorPrice = process.env.NEXT_PUBLIC_AVIOR_PRICE || 0.5;

  const handleReCaptchaVerify = async token => {
    if (!token) {
      return;
    }
    setIsValidToken(true);
  };

  useEffect(() => {
    if (!router.isReady) return;
    setReferral(router.query.ref);
    if (!referral) return;

    async function getCrontracts() {
      await axios
        .get('/api/contracts/')
        .then(({ data }) => {
          setContracts(data.contract);
        })
        .catch(error => {
          const { response, message } = error;
          if (error.response) {
            setErrorMessage(response.data.message);
          } else {
            setErrorMessage(message);
          }
        });
    }
    async function getReferral() {
      axios
        .get('/api/accounts/', { params: { uuid: referral } })
        .then(({ data }) => {
          if (data.account !== null) setAccount(data.account);
        })
        .catch(error => {
          const { response, message } = error;
          if (error.response) {
            setErrorMessage(response.data.message);
          } else {
            setErrorMessage(message);
          }
        });
    }

    getCrontracts();
    getReferral();
  }, [referral, router.isReady, router.query]);

  const handleSubmit = async fields => {
    let error = '';
    const resAccount = await axios.post('/api/accounts', {
      uuid: uuid(),
      username: fields.username,
      email: fields.email,
      password: bcryptjs.hashSync(fields.password, bcryptjs.genSaltSync()),
      idContract: fields.contract,
      idParent: account.id,
      type: 1,
      walletAddress: address,
      emailVerification: 0,
      deletedAt: new Date(),
    });

    const contract = contracts.find(q => q.id === fields.contract);
    const aviorNeed = contract.value * aviorPrice;

    setProgress(
      `Waiting for wallet response. You need ${aviorNeed} AVIOR to complete this process`,
    );
    window.onbeforeunload = () =>
      "Don't leave this page while sign up is on progress";

    if (resAccount.data.message === 'The username already exists') {
      error = resAccount.data.message;
      setErrorMessage(error);
      setProgress('');
      window.onbeforeunload = () => null;
      return;
    }

    const web3Contract = new web3Provider.eth.Contract(
      contractAbi,
      aviorContract,
    );

    await web3Contract.methods
      .transfer(
        adminWallet,
        web3Provider.utils.toWei(aviorNeed.toString(), 'ether'),
      )
      .send({
        from: address,
        gas: 100000,
      })
      .on('transactionHash', () => {
        setProgress('Transaction submitted. Please wait for confirmation');
      })
      .on('receipt', () => {
        setProgress('Receipt created');
      })
      .on('error', async e => {
        error = e;
        setErrorMessage(e);
        setProgress('');
        await axios.delete('/api/accounts', {
          data: {
            id: resAccount.data.account.id,
            force: true,
          },
        });
        window.onbeforeunload = () => null;
      });
    console.log(`errorMessage = ${errorMessage}`);

    if (error === '') {
      const resActive = await axios.patch('/api/accounts', {
        id: resAccount.data.account.id,
        deletedAt: null,
      });

      if (resActive.status === 200) {
        router.push({
          pathname: '/signup/success',
          query: {
            uuid: resAccount.data.account.uuid,
          },
        });
      }
    }

    setProgress('');
    window.onbeforeunload = () => null;
  };

  const connect = useCallback(async () => {
    try {
      provider = await web3Modal.connectTo('walletconnect');

      web3Provider = new Web3(provider);

      const signer = await web3Provider.eth.getAccounts();
      address = signer[0];

      const network = await web3Provider.eth.net.getId();
      dispatch({
        type: 'SET_WEB3_PROVIDER',
        provider,
        web3Provider,
        address,
        chainId: network,
      });
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await web3Modal.clearCachedProvider();

    if (provider) {
      await provider.disconnect();
    }
    dispatch({
      type: 'RESET_WEB3_PROVIDER',
    });
  }, [provider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, [connect]);

  useEffect(() => {
    if (provider) {
      const handleAccountsChanged = accounts => {
        dispatch({
          type: 'SET_ADDRESS',
          address: accounts[0],
        });
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      const handleDisconnect = () => {
        disconnect();
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    }
    return () => {};
  }, [provider, disconnect]);

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
                <div className="auth-form card mb-1 pt-1">
                  <div className="card-body">
                    {progress !== '' ? (
                      <>
                        <div className="text-center">
                          <h4 className="text-warning">Sign up in progress</h4>
                          <small>
                            Dont close this tab or close your browser!!!
                          </small>
                          <hr />
                          <strong>{progress}</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        {web3Provider ? (
                          <>
                            <Formik
                              initialValues={initialValues(account)}
                              validationSchema={SignupFormSchema}
                              onSubmit={async fields => {
                                await setErrorMessage('');
                                await handleSubmit(fields);
                              }}
                              enableReinitialize
                            >
                              {({ errors, touched, isSubmitting, isValid }) => (
                                <Form>
                                  <div>
                                    <div className="row">
                                      <div className="col-12 mb-2">
                                        <label
                                          className="form-label"
                                          htmlFor="username"
                                        >
                                          Username
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
                                      <div className="col-12 mb-2">
                                        <label
                                          className="form-label"
                                          htmlFor="email"
                                        >
                                          Email
                                        </label>
                                        <Field
                                          id="email"
                                          name="email"
                                          type="email"
                                          className={`form-control${
                                            errors.email && touched.email
                                              ? ' is-invalid'
                                              : ''
                                          }`}
                                        />
                                        <ErrorMessage
                                          name="email"
                                          component="div"
                                          className="invalid-feedback"
                                        />
                                      </div>
                                      <div className="col-12 mb-2">
                                        <label
                                          className="form-label"
                                          htmlFor="contract"
                                        >
                                          Contract
                                        </label>
                                        <Field
                                          id="contract"
                                          name="contract"
                                          as="select"
                                          className={`form-control${
                                            errors.contract && touched.contract
                                              ? ' is-invalid'
                                              : ''
                                          }`}
                                        >
                                          <option value="" hidden>
                                            -- Select Contract --
                                          </option>
                                          {contracts.map(contract => (
                                            <option
                                              value={contract.id}
                                              key={contract.id}
                                            >
                                              $ {contract.value}
                                            </option>
                                          ))}
                                        </Field>
                                        <ErrorMessage
                                          name="contract"
                                          component="div"
                                          className="invalid-feedback"
                                        />
                                      </div>
                                      <div className="col-12 mb-2">
                                        <label
                                          className="form-label"
                                          htmlFor="password"
                                        >
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
                                      <div className="col-12 mb-2">
                                        <label
                                          className="form-label"
                                          htmlFor="referral"
                                        >
                                          Referral
                                        </label>
                                        <Field
                                          id="referral"
                                          name="referral"
                                          type="text"
                                          readOnly
                                          className={`form-control${
                                            errors.referral && touched.referral
                                              ? ' is-invalid'
                                              : ''
                                          }`}
                                        />
                                        <ErrorMessage
                                          name="referral"
                                          component="div"
                                          className="invalid-feedback"
                                        />
                                      </div>
                                      <div className="col-12">
                                        <div className="form-check">
                                          <Field
                                            id="acceptTerms"
                                            type="checkbox"
                                            name="acceptTerms"
                                            className="form-check-input"
                                          />
                                          <label
                                            className={`form-check-label${
                                              errors.acceptTerms &&
                                              touched.acceptTerms
                                                ? ' text-danger'
                                                : ''
                                            }`}
                                            htmlFor="acceptTerms"
                                          >
                                            I certify that I am 18 years of age
                                            or older, and agree to the{' '}
                                            <a
                                              href="#"
                                              className="text-primary"
                                            >
                                              User Agreement
                                            </a>{' '}
                                            and{' '}
                                            <a
                                              href="#"
                                              className="text-primary"
                                            >
                                              Privacy Policy
                                            </a>
                                            .
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-3 d-grid gap-2">
                                      <button
                                        type="submit"
                                        className="btn btn-primary mr-2"
                                        disabled={!isValid || isSubmitting}
                                      >
                                        {isSubmitting
                                          ? 'Loading..'
                                          : `Sign Up Now`}
                                      </button>
                                    </div>
                                    <div className="mt-3 d-grid gap-2">
                                      <button
                                        typeof="button"
                                        className="button btn btn-danger"
                                        type="button"
                                        onClick={disconnect}
                                      >
                                        Disconnect {address.substring(0, 5)} ...{' '}
                                        {address.substring(
                                          address.length - 5,
                                          address.length,
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </Form>
                              )}
                            </Formik>
                          </>
                        ) : (
                          <div className="text-center">
                            <button
                              className="button btn btn-success"
                              type="button"
                              onClick={connect}
                            >
                              Connect To Wallet
                            </button>
                          </div>
                        )}
                      </>
                    )}
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
