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

const providerOptions = {
  walletconnect: {
    display: {
      name: 'Mobile',
    },
    package: WalletConnectProvider, // required
    options: {
      rpc: {
        56: 'https://bsc-dataseed1.ninicoin.io',
      },
      chainId: 56,
    },
  },
};

const initialState = {
  provider: null,
  web3Provider: null,
  address: '',
  chainId: 0,
};

let web3Modal;

if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'mainnet',
    cacheProvider: true,
    providerOptions,
  });
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_WEB3_PROVIDER':
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
      };
    case 'SET_ADDRESS':
      return {
        ...state,
        address: action.address,
      };
    case 'SET_CHAIN_ID':
      return {
        ...state,
        chainId: action.chainId,
      };
    case 'RESET_WEB3_PROVIDER':
      return initialState;
    default:
      throw new Error();
  }
}

function initialValues(referral) {
  return {
    username: '',
    email: '',
    contract: '',
    password: '',
    acceptTerms: false,
    referral: referral.username,
  };
}

const SignupFormSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  contract: Yup.string().required('Contract is required'),
  referral: Yup.string().required('Referral is required'),
  email: Yup.string()
    .email('Email is invalid')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  acceptTerms: Yup.bool().oneOf([true], 'Accept Ts & Cs is required'),
});

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

  const getContracts = async () => {
    await axios
      .get('/api/contracts/')
      .then(({ data }) => {
        if (data.contracts !== null) setContracts(data.contracts);
      })
      .catch(() => {});
  };

  const getReferral = async () => {
    axios
      .get('/api/accounts/', { params: { uuid: referral } })
      .then(({ data }) => {
        if (data.accounts !== null) {
          setAccount(data.accounts);
        }
      })
      .catch(() => {});
  };

  const signUp = async (fun, fields) => {
    let result = null;
    switch (fun) {
      case 'create':
        result = await axios.post('/api/accounts', {
          uuid: uuid(),
          username: fields.username,
          email: fields.email,
          password: bcryptjs.hashSync(fields.password, 10),
          idContract: fields.contract,
          idParent: account.id,
          type: 1,
          walletAddress: address,
          emailVerification: 0,
          deletedAt: new Date(),
        });
        break;
      case 'delete':
        result = await axios.delete('/api/accounts', {
          data: {
            id: fields.data.account.id,
            force: true,
          },
        });
        break;
      case 'activate':
        result = await axios.patch('/api/accounts', {
          id: fields.data.account.id,
          deletedAt: null,
        });
        break;
      default:
        result = null;
        break;
    }
    return result;
  };

  useEffect(() => {
    if (!router.isReady) return;
    setReferral(router.query.ref);
    if (!referral) return;

    getContracts();
    getReferral();
  }, [referral, router.isReady, router.query]);

  const handleSubmit = async fields => {
    let error = '';
    const resAccount = await signUp('create', fields);

    if (resAccount.data.message === 'The username already exists') {
      error = resAccount.data.message;
      setErrorMessage(error);
      setProgress('');
      window.onbeforeunload = () => null;
    } else {
      const contract = contracts.find(obj => obj.id == fields.contract);
      const aviorNeed = contract.value * aviorPrice;
      setProgress(
        `Waiting for wallet response. You need ${aviorNeed} AVIOR to complete this process`,
      );
      window.onbeforeunload = () =>
        "Don't leave this page while sign up is on progress";
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
          await signUp('create', resAccount);
          window.onbeforeunload = () => null;
        });
      if (error === '') {
        const resActive = await signUp('activate', resAccount);
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
      disconnect();
    }
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
                                          {typeof contracts.map !== 'undefined'
                                            ? contracts.map(contract => (
                                                <option
                                                  value={contract.id}
                                                  key={contract.id}
                                                >
                                                  $ {contract.value}
                                                </option>
                                              ))
                                            : ''}
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
