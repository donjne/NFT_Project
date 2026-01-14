import React, { useEffect, useMemo } from 'react';
import ReactGA from 'react-ga4';
import { useAccount, useBalance} from 'wagmi';
import { formatUnits } from 'viem';
import classNames from 'classnames';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { shortenAddress } from '@/utils';
import { isBABTHolderAtom } from '@/store/web3/state';
import { useBABTBalanceOf } from '@/hooks/useContract';
import { gamerEmailInfoAtom } from '@/store/gamer/state';
import Popover from '../popover';
import { useLogoutCallback } from '@/hooks/user';

function Web3StatusInner() {
  const { address, connector } = useAccount();
  const { data: balance } = useBABTBalanceOf({ address });
  const { data: nativeBalance } = useBalance({
    address: address,
    watch: true,
  });
  const gamerEmailInfo = useRecoilValue(gamerEmailInfoAtom);
  const setIsBABTHolder = useSetRecoilState(isBABTHolderAtom);
  const isBABTHolder = useMemo(() => !!(balance && balance.toString() !== '0'), [balance]);
  const logout = useLogoutCallback();

  const formattedBalance = useMemo(() => {
    if (!nativeBalance) return null;
    
    try {
      const balanceInEther = formatUnits(nativeBalance.value, nativeBalance.decimals);
      const numericBalance = parseFloat(balanceInEther);
      const formatted = numericBalance.toFixed(4);
      return `${formatted} ${nativeBalance.symbol}`;
    } catch (error) {
      console.error('Error formatting balance:', error);
      return null;
    }
  }, [nativeBalance]);

  useEffect(() => {
    if (!address) return;
    if (isBABTHolder) {
      ReactGA.event({ action: 'BABT', category: 'Show', label: address });
    }
    setIsBABTHolder(isBABTHolder);
  }, [isBABTHolder, setIsBABTHolder, address]);

  if (address) {
    return (
      <Popover
        placement="bottom-end"
        className="z-40 border-none bg-transparent"
        render={() => (
          <div className="flex items-start gap-3">
            <div className="backdrop-box flex flex-col gap-3 rounded-lg p-3">
              <p>{gamerEmailInfo.email}</p>
              <div
                className="flex-center cursor-pointer rounded-lg p-2.5 hover:bg-white/[0.12] hover:backdrop-blur-lg"
                onClick={logout}
              >
                <img className="h-5 w-5" src="/svg/logout.svg" alt="" />
                Disconnect
              </div>
            </div>
            {connector?.id === 'particleAuth' && (
              <div className="backdrop-box rounded-2xl p-3">
                <iframe
                  className="z-40 h-[37.5rem] w-[min(370px,90vw)] rounded-xl"
                  src="https://wallet.particle.network/"
                  allow="camera"
                />
              </div>
            )}
          </div>
        )}
      >
        <div
          className={classNames(
            'flex h-10 cursor-pointer items-center justify-center pl-3 pr-1.5 text-sm font-medium',
            isBABTHolder && 'overflow-hidden rounded-full bg-gradient-babt',
          )}
        >
          <div className="flex flex-col items-end">
            <p className={classNames(isBABTHolder && 'font-medium text-black')}>{shortenAddress(address)}</p>
            {formattedBalance && (
              <p className={classNames(
                'text-xs opacity-75',
                isBABTHolder ? 'text-black' : 'text-gray-300'
              )}>
                {formattedBalance}
              </p>
            )}
          </div>
          <div className="ml-3 h-6.5 w-6.5 overflow-hidden rounded-full border border-white bg-p12-gradient sm:hidden">
            {isBABTHolder ? (
              <img
                width={28}
                height={28}
                src="https://raw.githubusercontent.com/projecttwelve/icons/main/token/bab.jpg"
                alt="bnb"
              />
            ) : (
              <Jazzicon diameter={28} seed={jsNumberForAddress(address ?? '')} />
            )}
          </div>
        </div>
      </Popover>
    );
  }
  return null;
}

export default Web3StatusInner;