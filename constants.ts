import { GameTheme, GhostName, ThemeKeys } from './types';

/* ───────────── Configurações gerais ───────────── */
export const CELL_SIZE  = 20;
export const GAP_SIZE   = 2;
export const GRID_WIDTH = 53;   // 52 semanas + semana corrente
export const GRID_HEIGHT = 7;   // dom … sáb

export const PACMAN_COLOR          = 'yellow';
export const PACMAN_COLOR_POWERUP  = 'red';
export const PACMAN_COLOR_DEAD     = '#80808064';

export const GHOST_NAMES: GhostName[] = ['blinky', 'clyde', 'inky', 'pinky'];

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const DELTA_TIME              = 200;
export const PACMAN_DEATH_DURATION   = 10;
export const PACMAN_POWERUP_DURATION = 15;

/* ───────────── Paletas GitHub oficiais ─────────────
   Array de 5 cores: índice 0 = NONE … 4 = FOURTH_QUARTILE             */
const GITHUB_LIGHT = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
const GITHUB_DARK  = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'/*'#FD0000'*/];

/* ───────────── Temas do jogo ───────────── */
export const GAME_THEMES: { [key in ThemeKeys]: GameTheme } = {
  /* ---------- GitHub ---------- */
  github: {
    textColor:      '#57606a',
    gridBackground: '#ffffff',
    wallColor:      '#000000',
    intensityColors: GITHUB_LIGHT
  },
  'github-dark': {
    textColor:      '#8b949e',
    gridBackground: '#0d1117',
    wallColor:      '#ffffff',
    intensityColors: GITHUB_DARK
  },

  /* ---------- GitLab (mantido) ---------- */
  gitlab: {
    textColor:      '#626167',
    gridBackground: '#ffffff',
    wallColor:      '#000000',
    intensityColors: GITHUB_LIGHT    // fallback
  },
  'gitlab-dark': {
    textColor:      '#999999',
    gridBackground: '#1f1f1f',
    wallColor:      '#ffffff',
    intensityColors: GITHUB_DARK     // fallback
  }
};

export const GHOSTS: {
	[key in GhostName | 'scared']: { [direction in 'up' | 'down' | 'left' | 'right']?: string } | { imgDate: string }
} = {
	blinky: {
		up: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABiklEQVR4nIXSO2sVURQF4G8mMwa8QU2KxFcjCoIgacR/oCBYCP4fsTEIBkWwEK21UAQLIdjYaKEiJIXBXhNBCFaSeDP3zLa4mdyj5rHgwNmPtffZ62z+Q4miKHlWs3yALwUvKYphbC8UjDN3nIUB/SCCSDRnWKiZVxTFrvxp5kMRHbEltaTODuIED3YkT3FnUy+uS815qQkzMSJOxAWpuSo1A72Y4f5f5DFuBpE+vmsmZ9ukF9Eu/xwV+Pw1TEYcOtum9GmxCaLmdl7jeRDp968mcnQFMqS02bSkMV5tS36UBL6t7ixO6o/uK6sKymM0Q9l5NKC/Ldb3lWGrqenRCw73hr61H9viDujjKbztnLnae50uF4sl1nf91/2xvt9q7YuyEwKCNg+2DFoGue/fnHLoGwbyZQ/akqqkykkFZW6XmNy6VJdYyhPP8eE07/PCl1kqqbbMI3BrjY1rvMH4SW4kmou86Eac5UmiOcUcxq/wep2NirugYh4TXfOah6izUauax5leB2vuwR+e2vAshd8i9AAAAABJRU5ErkJggg==',
		down: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABmUlEQVR4nHXTT0tUYRQG8N97/TOloSYpYv/BNlLYqqJli1Z9gz5SOwkKgpDaRBS5CKJ2fYFWrsyNZWKSOYliw8y9p8XMHa+Tc+ByOec8z/M+7z3nJidHwhtc7ORreIjog29H1iYunmc5iPIpyGd5h0cd8ZNPvcLzXmJBXq1N8/g/kSSlyywFkdPMaVZJvfVZnkhHImmSZyWol9jrqMSMsti5tmhwJyhSO+8bZT8ogrulQDbDQZe8/ZPt38eZA9jbZ2OjKzTFPpJxPrdoBFFsruVRxq+tI/v1nW45vn2NIFo0TvMxTdLcYRBt+DHPne/Up36GvaygDn+p17+srp+d59S1KHyvXOPHgaFLTC9gfUtQdDp/TLAbRJPDQ2O7cyIuiAgzlQlcjSkR8yLCWJS7McJGV6Df2HoXqZqPsJmVdk56J7JEVrGsmida2TATZeM+q+U4E9kcKzdYqe7Hg+OYcdN8atG41f5Zagu8KMhv8rbck9u8L8iv8xS1e3xo0TjHMgyM8BJDnUMGa7xWjrYdQ8O8cuSkNsoSsn/EzgO2a6zxyAAAAABJRU5ErkJggg==',
		left: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABzklEQVR4nIWSy2tTURCHvzNnzk0TS21sQluhq4Kb+sAH4qrgyoV/oNuCUIogEUGKf4DoolBFfCC4sYKgDVXig/Tec8ZF7k1uo9GBWczvnN8H84DpcM6h6ruw14VBBwZdeIX3inPuj//18FkmS/jtDdgvYGhgBhYhvwwv2khPs8z/3R2CnIcHlWlWXsXvMleDOEBVZaM0R8gTxGljghghN7BLyK4PwY/6UeUsbNuZlsVvn3JLyWz+1MTc8mbHP8x+HpmpWgVZhh5OKsbc0/6bgxhjzM3MbDicAN4f2jj6fUsQE8R52McBrcz7VbpPaJmxWALMxoBOMPMrE0bV3hXYC42grMCziOY3SJG18lf+fQxYx6y1XupfP1t9M6vwkjZ8GQ3JR3t3YHY8MGvWZsBpsw99s8GhmZwcbBd+sQQf/7e6WdmBIynKdRqkf17ZjBCrFdMQg5SgmNbqNySuFAySGwFP1AI6rVW1g0KANoCA3oK3DqR8lIvw/Bzs17Xb8LqqBTosI70ChjfhEVnWuIC/EyHfhIc4L2jmrqH3IuTX0S2azcYmcr+A4RrymCwEafuwJaoNAB+CLKjuiGoY9+q9XxDdcSF4AFEJiyJ3QwjyGx0DPZpbZTAYAAAAAElFTkSuQmCC',
		right: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABp0lEQVR4nI3TO2tUQRQH8N+9e9eg0YBBlwR8gNHKRqz8Amph4zcSBCWgEBALQbAU0U4EUewsfDQJNuIDiaAkSNhCY3Rz79xjsdndaxKDB6aYM//HzDln2DayrMXDgrct3hXcR7Y9dhMT14/wNFEGEURFb5onuLKjzDQ3B6QgalJNauamuLYt+SA3gkiUTffBauYPbBbJmB2AalJ8+Ryx2o1oN0Qm9kSdeim9Xyh/FFm0uNzUeFSTEmUsfoxhLC6NBNbXIyIipVR+fTGf8AAKZB2qjDyoHZ0B+04wvjJleWDRbisTuzponcon5Om7OoN7Fb1hsVY+RUTE2PGIw2J0g6jjd0TYG3FBnSp6uAPzg4oPwd1vEUvdCJ2RwNRk/1mvPwyxeF5gbUtLJjtb27TcJdsyBGs58n+Mxf9E6y9yUDf3NVVNtQOmzm0Agjpr3Cb6h0VO0SQNu9WPlGNS/x3FWRaawBlenuRVU/g8b/J++2G/grlVfp3jMcaOMZsoT3O3ryM/w4OK3iEuYewiz9b4iasDtznsHpi3uG3kAu2CW0Zfery98R/+AA8N/U/uOBf2AAAAAElFTkSuQmCC',
	},
	pinky: {
		up: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACkElEQVR4nG2TT2hcVRTGf/fc+2bey4xJk9hoXGlMES0uCoVoF4IWW1BEkWBB6lKwEPBPLXUlhYIYEiouRDdSsGDalJYmrtIuhECLC0MQIaWmgo2RJo0WMmn+zMy997h4aScTenbn+8453+E798L2EECMFHDjCWbRwoLDTmBEcrI5TFNiDWVjhtJgX549fGV3W+nplKisV+dqu344+NuKrP1SMeZDfNSHDsgonprq//njZ7v2QpJAYZOoAhswW5lm37mXvvlX7w00rZEkiSlRHLz5/mXd1xbqEOr6kaoeq6l+qqqfqEKoP1/21bkPJrWMG7bW5uLGGIDj1/svqq/4as+LqjjVym1V/TKqnlBdW1ClRfWJPap+xVf/endcgc+NMThVBejY6UrQAn9e27JazUCA7DHQ1RwKAbq0FaBTVRFxTtpNKU1dEe5us7gG1IGwBVuGLEnoIMuMtWKAL268ef5Y73NvI8E7jhagCxhSmN/0uLsOx5Nc4NQaUVN/64+f6Lnw1rcOKJVc0WHwrCYwCFiFumncaDGBzzxEB7UClKHVpA4oOSCEGPNCFyFY8Kb5wApsuM3D50RdPECQBgSEmDc2gIYBFhAFzcVMFADbeJsKMbVeVSOqoEpIqYUitTwPqBJjwXoCaN4aBfAh+BjT6OXO786YuqgQY6rezk0VZP7XQiyqRyxGosidaRez6GMIEfACdO7IOsUt/Zc+dfbA2MTMdzVTNrJy+6orjPSdcT++cHr5n0lHBpMz3/snR1+95Jb+TtvTRwR4FOCNM6+cXOorPTMKOIF3xl77er3btn8FgMDjbufQ+OvDVYH3ALen3Ds6sv/EMtB/34FDQEtusgE4wpa/K4IAAyIPoIx8GP8DW7gOkh3Y7ZsAAAAASUVORK5CYII=',
		down: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACZ0lEQVR4nHWRy4vNYRjHP8/ze885c+GIuTSZxriMS6KkKeQSK0lRDAsbthaTzSyUqYlhxYIsJkTNiGYh+RMYKRFTM5Fxq8ll3BriMOac3+95LM45GYOn3sX79n2/l+cL/58e4CkwAtwFwr9A8tfNOQJsernr2toFtauyFPIgORp7tw68TT6PAgcA+zcBdD7be6O7pXYDVNbgkVsRJEruPR6/puH85hsfyO0uk0gJgOOdT3b1d7csbctLQVRjDXhZxrHgMQH041Cov7jx+kdye0TERERw90PDOy6fXr5yXyxfRcVRomnmzADHqiTWT4Mhc7H1ch72q7sDNC+qnI/FFkslyhwB8d+f3SBL8RTAq5otDysA11IMicSQClE6BI4CS7yYUoB6h2MKxyOYC1JItEGyeSAC6B7c2Tdhhy3xN/7nnHD3jrz7xJQ3c7cuS5L99wsKdxRoakrXVzhu1JTilt1nAI+gYlrVATQ1NxgsUyA/GSfgwBdYvB4ihVfPgRQgCuOgjSDV4O9AIlFsEmBCAfEIUOBsQsNIUajpFPCmALHDSWgag+wPkFPANyAogAbABcDBc2q396HFtYJZFBMc/S5htL0UL7ZYEBUxBUyBxA085Sb510rKIICn3fTHWNBvo4FM0aFn3PTnWPCUW0k2VmDWjFSGKCHdemXL0IMXvUYFyM9Xurh39aCcWziQez8AlWDjD3VZ3+pBHX8USGcB6gDab23r+by9dt09oErg4HDb1ck1M5feLK2RaqIzI3v7JxeEuj4gPU9nX3rc1j+RRq6Wy+kCaqeUdQaYMa28C2XCYpH0iKC/AKR7DJ4ZSbreAAAAAElFTkSuQmCC',
		left: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACnklEQVR4nG2TTYiVZRTHf+c8z/vee+emNVycYBocHAqGEN3IgEgg7bIZBir72CW2aNEERZiK6Ci4sNrooi9q02KaZhYubNGuhVEkLcqmLkhpwgwqRGBzZ+6d+77POS7uxUw8yz+HP/+Pc+C+EREIIsAc8AdwBVhEEOT+bf4PxTySinQid9+z8vKFpxoDT1RB+KdzrTM69+zFDuknsni0LMoHEAhkzuzV/V+fGNmyC2qP4sENQLqirK9wa+0XHv9q+kzL7DBm9xCoImbHf33x/Mnx8amurIlqVyOSIAnUFcus9MLtxl/f5FsXJk+6yCzufc/wxqVXvvC0lgozS3624z6T3Gfc/T1zd3dvuduxjVQeKjeaz8078I6IoO4OMMaBHXjFTUSUNyswBNQcXu27rIO8nSsK45VRgG3ujoYsyAC5TDyzkxhh5UY/k0zgtlAZhXxrHxsEHNCe/xijaCrS4e9e+Pz1fQ+7Qcgl7y+XBgapfU9N6xDakvtju+3n5+deK8vytAIjw9aoXjjo5k0YbgAfJripUIXyXeg2gQ7wfgHJ8MxtRBs5MBKBdpE2oArMlUCA1dDrR7yn5IMAXevhwcGgSwGwHgHtSQb+TSCxh4iDOxQKfwOiEB3KBATUBSBEQFx64XiWmxgKBg6WU4KjySMGJMFDNMzvxqJAwhzP3WT9poJDVDyKaet61Nb16CoGCkGQ9rJ65ma9I00K1DfHOqFb5hOLey83l+eNKsja7zr82Y4ft3z65PfSWlIG4M/lBXYuPH05dDv55vwhgE0AB7+d+vj29NDEJaD2SNj01tJLX7a317adBxRBx+tji7/tX9gYjLUjQG3f0MQPFyc/WQVmCCGg6DGgAaBRBfQcSOU/n5oBH/XfHGBQ4JRq5A5IWx73SeLhogAAAABJRU5ErkJggg==',
		right: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACmUlEQVR4nGWTT4iWVRTGf+fce9/vj6Nf4/hnRlEERVcuAsFw0SKRRAhSiBJXgiQiqNRCwc1AC6FsihYVtrKYWShRkkSudBNFCPkVrSSmwj/ziVoa8c3Me99zXLzfTJTP6p57D8957nnOgf9DAUECXCxgJsGdAvmWIAF9Khv5TxAChcWJpsuO6QOXtw4v29wmOzZ3P2+Y3Nm9XT3qWvRDZPxpAkWWWXp/ev/lY8uXbwfpQGvw5sDsn/jjXxn7dOf5Ho8PDm5rgpSSpOzvTL/21Zsja3bNS1tURSL3ARWIjuGZlfD37e/jxg93n38U+wdzzo6IAJz+7dVLnk/mOR8391mvcc7dT7j78dL93Xl3d6+qqnxw6ppH+EBVUXcHWDXGSN3A4wINyEB/HzAELBV4IwFQAX+8vMUyjJkZKkG0Q7MoUgIDnqm/3VoN7RXAPaAIAPT79fHZ50Z1tFiXUiCoV/7e9b2Th2zdthz6FMzUBBs2wfBCyVwBEFvAKo27Om4/7596qaz4XIHO0tCICLWCCaAHN6/Cw3FqJ/5SOFOSSvAuXDkCK6qmAsMRKDNWmxIc5oG3HaJBqRCkNquX4HQeWB4G0igVcF0YB/fa2EpgNoDZQmKNuQh9Bwev3bN/h9PAipDd3RBAK6whuWowj/giubVCxsEGRRWwbJVZy7Le60aRSgGskKx3f4x+64fCE4YKBNBeN1rLsrlZrR5WjjQ7Gh/2musv7P7ym18+nqUNVe+7OPTZ9qk0teOTmd+vKEvgxs1J1k4+fzHc+alIjSEFRgH2Tr3w1oNtnU0XgAi8cmnPRH99Y/VHSK1ziDj+9YtnyzbFUSBsbKw998Wes/8Ahxc6cABZXB2AIyISFvdMVYATMcZBTAJeB3gCWn4PpFt1S94AAAAASUVORK5CYII=',
	},
	inky: {
		up: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABzklEQVR4nJWTzWtTURDFf3fyXtqSCKa1GsWPTRG6UdSVa/8pV+JK6kYh4EoIIrgRuhAMgitdWGqhdtFWq0IoIsVqQUSSZ/Jy73HxkvBin6ADA3fOnXOGmbkXCqwEBrSATWAbeGhFiYeIpdgBDY7OtfiUpHgJSbz7kjBVfQrciO3vUo7aqQe0BxlJEiF4QvDZWeLNZzF15JYrJB+bb7KZiMuDHhd8OhYZ+Vmfcs2nbOyK8vRt54YyBlCqNPja1bL3KRY8Jj3JkVu/JJCO14N/5H3K1q6Amy4rDWCvCMH/8D4NA6kfJJ8TkKQkSApS2/uUrgQsA1jknDFbH+CcfQRcCWIHO7n+vgHTLqu2A+CBciWNsz7Kz9nv90bDakv68Gf/kg4kreSH+3YvAe4Dtj8GC4iFHoLnpwSsGdD5lzdyyPoC6NpoEf9v2Q5stAcAQhhM5IQwKMRyZhACAFLALEKajPMYMI6VZRnY/PAmYuHiaw76WUvfMWZmX3LizApyGba9B4tX1jGLqABQg3K1yepWh3MLTYOIk6fvst7uMVe/5xj+zPOLj1l7n1CtXY8h5tLVZ7zY6ABLWGQOuOMgAnDOGdBgcrjxEBsNbAZYMov4DRt5NkCBfZ1GAAAAAElFTkSuQmCC',
		down: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB10lEQVR4nIWT3WsTURDFfzP37hrTD1QM9hPTYlP7ov6hvgcsvhSUUpD+EfUpRKEi+CRUkYgFrTakabK5d3zYTbLRiAcG7s6eM3vmsBfmQMCRpi1uLFyQVi+oVE8UdB53Bk5EcZWXrNbbXIUMM8PMuBwNqN1/C5XnDmSu2IOyvnXMsBDNq64ZtbUjnRkigogoK5u5OISMGMNf4hAyQuFqe+/QqU6GCEn1BYOC9K+vlwf1zPDJviMPxsiudkks/jekMW5aZJQ9jIA65xwbOxERRUR/AudzNFZUsbay3YhevYPqcpss37ljU8SS7R+l/kczI8ZAP2SIPxFIuthwEeDaLOpodO2cS1XVj1OKZjGEMDSzOPS+sjh2IXKuOOmOnb0GFm6DW4J3JfttIEkt1moWW2b5ugFAekDybSblTTM25qS/YsZucY4xMDIDd+Yp/6Jmkc8yfY5xBICq52uJM4UqECcvRHRCMIuoelT9jKjMyRvpILdlRuPJKd8Lmz0zlm61uHOvRVb0OmbsPD6drAW/YGH5Fe1PPbYaBykkrNWbvO8MWK8fOBABpb53yIfLPndXnzpIePDomDdf+qSLR4hzCtJU8OSBKOizP66vR/y+Ux33EnBN71P5DQllVXyQma9lAAAAAElFTkSuQmCC',
		left: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB4ElEQVR4nH2SvWtUURDFf3Pf24+siYkYFLRRizSaSiVi7V9g7b9hpSgogmIhipVbC0IwQrTQRgQ/CiMxCbsgxi9iIMHGENndrG/vPRZv3+atbDIwMHM4Z+65946xc1SByW791cwuSNIufIiiCOASFB8z/71FU2JTor7miSpPgKtdzgAxgCtdZ2lVSGmG4AnB9/r6uijsuRlh/WLnHLjyFea+CO8TOp12T5Rlp9PG+4TlX6JYuuGcS8VmBnCRd3VNe5/U8id284Okl5kj7xNq6wIu501Mz/xck/c+kaRaTvxc2/FUSh2G4IFnABQKDtzehzYksc8nG5spuefgqDRyJMUa2YBEwsrTUeqeO7z/1uBk8CBtbXSJWQ5LVNIBH/OPu7jSAB4AvOZ3Cs5sSZv/P56kuSDV81gInqYEzMdAky0Po47zpcFffNoGgH8BaDnAMLfDau0S6m5ArwSQQj9JYSCWC9ebJgUsZyXrzVyfqL/vOGCUYQPnYianPrP8J2M6Dh5eYv+BBXx38GoTTkx9wrmYIQDGAG7zttbgzLlXDsqMjV9j4UebieOzBpGBcWziEYsrLcYP3SpCiVNnX/BmqQHcJ45jKJTvAiMAzswwqwLF7XtaDK5q2ZWhgovvRVHMP7z+WsD4PpRYAAAAAElFTkSuQmCC',
		right: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB1klEQVR4nI2Tu4tTURDGf2fOvUlMcAXjigpZFfGBlaAI+h/4T9nYCClslFiJLlhZbJXCJmyxrs91bdyXYLFE8UGURaImN3PG4t6blxH8YIr5+OabOXPOcUzBpeECPAAuZnRb4FqAMK2fgPce4Aa+2GTjY5dgRt+M9m9lbv4xcDuOvZtdDEixXOf9F8MsjRCUEHSYf1KjWrvv00GnEJdusvPNUE1QTYZFeagmDAY92j+NucP3GJo4l4799msqCkFbZrY7bWBmr0LQF6oJux3Dx3dlrP8SGhTVpGkjPBsrXs84VU2e7CUKPAVAxDl86RH9dMxOJtx/0ozKyCAHhzQBM/yJ5ShCABbZ+NDLl7WcCavHzCiNDLYzXiIzjgdlM+lRLLYAXrOXbTwTr5rZ1owd7JjZio1pkU4EdOlPXsjVf7yTM9OEoyuAzLrV/4KJyAQRwuCvfBY3BgECBpgFRKKRe5aLRJiFCS7P0YEAB6kAIhHnLq+z+TkzcMKR2nP2lVf47tJJOwPh7IU1yBtZFaBO680PLl1pFqBA5cB1Xm73OH1+qQBeAOaPNlh794vawp0CxCycWmR1q0up8pBsDXVwZUi/MtAACvlpXHrUhkTiMyoCbvk4dn8AgDJfwO8SCRMAAAAASUVORK5CYII=',
	},
	clyde: {
		up: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACj0lEQVR4nG2TT2hUVxSHv3PunZfJm5CMiSGSaigxUDSIFv9sutBNQSiuCl1YpO2iUdAiFURKRSUBiyC6EFEsLrJQEHHdlXShiwYpVVBQpJuaVkZDdDI248x7954u5llH8MCFy3fO+fG799wrvCfUJxLz9mXgwwL97rw/HPL8feVvw3sPcLwPrv8z1W92ELPvscdfpS2Fq8BBEXmnR7q3vdjJh1OjP4wNLmMjLyOlItNGWRjk7t8pH8/OHxKRs2bWZVk9Kcw8+Ha97RgN2eRA3rKZCbPTmJ3B7Og2+6Anb32+NmR3vh4JwHfOuUJdBAc//rV/2MLS7YxqDGBmTx+anfdms8O28OcTA7OBiRhC45fszu4+A/aKCN7MCLB1zaARKxt4VRPVAPR+BNEgKzM0vpqXDXAV0RjWtTetaHpg0szwmnjSdv6aDOAplaS/ONhzMMCaQGCgr2M5SE1DVJQQxDk0tvOLj6Yqu2xkIerspx5qQBOubIdmgPoCXPuko5k/wl3amZTWZfHu7upUCOGYBzaMVpZTKxGpPYEL46AlqNc7MwrA/Bz8XIXMYGkJW0EcqzRSYNwD/xIUYgAFGssd69o16AgsFoIFb0UFQlMB/3/CigZfNFuxKNgbMQMRA3CFnoMAMaHzVouiWCaPZXKsYHTVFFYUyLCA9RB1UTyuQ80Ttea8PhdvJSLa4foCHxPymLsIZAoMURa0lvrJs/63xccJpCDzFU1PhptjP9ltedarpPDgj0q+5Vwy5+tpub/8WoEqwIm5L4cbmwfcDSAZ8kzf/2ZVa1S5WNyi29jvbtzbs7qZIgeA8merSrd+/WJlHdiHcw6PnwZ6O/9CRXFnQN/MARHpcXCqC1UVPSIi/AeSmwjoBKJbfAAAAABJRU5ErkJggg==',
		down: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACbElEQVR4nHWSu2tUYRDFfzP37t27DzbZyOrGRyISBIPaaKNNChsbKxEEKx9EEEUUUkgKEaKCRAVfUUNasU7tH5BCQaIiEl/EmEgIebnZzd29+41FEl2DDkwz35wz35wzwv/jOrAHqAHTwDnABLCGJr8RIQJmXAJ2vz2ROt65YTmNMyajLDsGS5kqfAKu/YVZN/XK2KncjY6NFWit4ZLEABKj8l31x3yK7QNLdyO4/C+C3s+n833t++diczivTICtdgjUU1QRiN7kgpaBxXsRXGwk6Jk41XSrdd9CLCVUQPHW/c2BGc4yuPKHrJ+7X+o36FnToGvzlrIzAUl6itZXpFtTS4BQEUMtdi5TjB1wCEBX30tSFSURwtmXcGEaCh3gVsG5FrjwaSWbNyHVuqZhcW2DxxPdmSX3IFG3yoj9iWmzJ3mze56ZfWioj5l7lKtXzjdVgGEFDmxpKqcJahB2NixdgIQPosDOhnoHBEbYshACXQosEgs4hegLbXtBUlCerYBfBa8O5Sn8Ngi2AqVxRGOlqgA/FfBRD5yDwaMkPwPLkH5yBOYWIHIweJjMNwi/A0+PQVQBLwBQ/7fKMdjyRzfWW1AsC/IVBzEKWhv1F/raQWLMTToikBUDnA/EmMNCnM4GPvkZYAYDp3PqYx7WVHOSHVc8kPlAXbYaC3UViBVoIanofMbfd9tGZ95nIQCZzWt7n3vVfK02IlN5JQC+ZOm8yWudSvqEYFAAuPPuZHHpYDMvgDAHV8e7i9GuFMOAB0hRGJo4U6xtUx4DQUeCZ+9PFys+PF/zph/INNzdABA0eKfA0CohQAJ4CMgv7wr9rCokR+cAAAAASUVORK5CYII=',
		left: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACk0lEQVR4nGWTT4jVVRTHP+fcM783b97TpzNqjDMaZTCFZBJCbqRN62jbRhGrhWW4axM0BrNIEJpwCoUGghZtbOWmbWoUEU0Jok8xCMU/U6O+p7557917T4vf82V54HsvF77nfr/33HPg/yECqgp8BzQHWEQVEXmCbv85mEmM8dhG9x3XDjVeLcbuGaos/92YnD55Z6qPnDOzj2OM/+o9rt1Qjt9+t3Kw2NCFBriQEZAeShv+vLme50+0jnTUZ8kZAH20roP5y4emDtqLxLyWSA+ki8oqSmHkp0Kc3n4nNg/UPgpZPhw+R0QQmLv+wYyn9Fs/5+XkX25zP0qJb15w97Z793fPx4uUFuhf3DfuwOHHa3Lq6vmfU0qp7+7uvuy+YO6fr3Hv3PJh3P3B+1/Q8fdxYB5ArQhSlyrP7tylYS087AJsgELhxiTS2MTGmYFMYxsSUVxQEDMTjb301aV31r++o+aZh2rBAFqQUpnUg/TIafcaoUPhz3n+dd/42zHGIwo8s3n0pi3NzpBuXaUS2vD1bmglqDfxT/ewcqENqQmLr4GDV8hbK3dHga0GdHCgehn9djskg/v3y/8RQM7C4iT0EjxYLZ1k6PcN6HUMUEShl0tCoIQPsAqsPhhcBqRyF8kAQQFFHQTyGHGYDOQKMVeIQzeAG2UHBYaNFMmOF2RdKUuIlkS9LaYrZj5CxgbKbdQD2aMDJAXWURj6V2EvzY/80vqjBjWQ63VdM8f3W47qT7JSU6pw6UI9v7IwuhRa1aJWcYA6wNzS3on27gk5DVSmRmTuylubO09XWQQVsPDyhJxu7p/o1k0Og1bfmLYfz7y5qQ28h5kRkE9AxgBCCAosgIbhlAmjAp+VUw6g4wKzqso/UZISjmIm/qIAAAAASUVORK5CYII=',
		right: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACkUlEQVR4nG2Sz4uVZRTHP+c8z33vfe+90zg/dEaZULlUEgQa1NZ/wIXQtl8bN2HRJlq4CwRhxDEZBYtpF9QiaSHtWgiioBthwCjMizk23hrTxmruve/7nNPivd7IOnB4OHCew/mezxeeDhEQkRpczODnGqzV4RohBET+2/6vQlXqxnIT27/23tT+fPL3Jm54f8L2Lv157W6yLrXa61YU9j8DVKZFz99/d/JIbfYR5Anq4I6Jo2xmsAm7Tw2//sl4DTAABYgxyjR2vnc0PxI6D0qboySfgj7IAGUI1h6Wtk/LO8f2HH4WLsQQVMaaYal/dNrTMoV/Muvut9y97/7lPvdF3E/ivtJx94ee0kaRFg/4BHyO6nj/r+xDUjpL4eX3Po4/NtzPTbkvB3fvubt7SqnodbsJ9GolPIjOoCqeKSiEDgCNXSDtGbg/A5kDOwAI22Bu7x6dknmyKFE9+YU77zxzyHcNTYcWsZsAtCchA3CHZMA9HCDX2Mlg7f1tr2alX1dgodV8FAlACXx6EMrv2Fh9wODMy9D+ER4DK68g3MW7t7m1+BzN/KYOYCECA0wABwc2H8K5lyBTsGLECfhtHc52KvJhCASMNIgVSq+afAR2kKCf/nHKk/yrgBI8x4SKQTXfq8cyyvEnBWtQWp1ybDcBa45qDzwxkgF4humvWt1CwCOmPaKuS/SAEcADpr+ESI3RwTAFZmmArtfji6fl8r3VFrRAehO64wTfZif8G++2lTps3Z7Q50/rJek2lNxIsB3g+JU35h8fmA4XQbM2fLD65sLWC634BQQFYQ7O/PDWzmJnXZZA4+4GKzfent9qwWeoKlD7CDSvRCkCp5Rq0crtQSK1jzWOvKsaFT0ZY5S/AWqkD0QparkoAAAAAElFTkSuQmCC',
	},
	scared: {
		imgDate: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADCklEQVR4nFWSX2hbZRjGf993vnN60qSNXWva6JpR7f5km7qrWrVUXYt2HdOCk2FBoQiDsivxRmU3XggiKIIIuxgOpxeyKsL8A8IoaJVNrMy4Mant2qZbMxKX5k/TmJ6cfJ8Xyao+8PK8F89z8bzPK7gDIcHo+t42GGbwmzk8vwJCIi2HH4d7KfxcAgFCbGkFANIB7cH2l3exc+IVCHfRtn8Mzb/IJ6YQpSxzp94h9enSHY9CyLq5Z3If8ddO0xrrpwr4/B/tDz2PDbj37EW5x1k5PYeQSIyBHcfjxN84QzDWz0a1jNY+1n/MFqC1z0a1TKhnkH0nP2L7xE6MQSAkPH7lPJG9R6j4FXzlstkwBQADlBscAKiWabGbWZ39hJm+lxRGg59PgdFUpdrWDf1xWCvBpV8AG548CIEAXEiAl5aKmtF42RsYgyK4x8EKtSOFZMPo8SfggxfqJ7CPgAjA9Ov1JIffh2/PC0lYSJy2KKHdjmLw0gJN4W48o1FS3S7UxVfSdTYa0lXotKFQAiyp8IxmW98EAz88LBgtpnBaovU6G9kdoAZ4jaKdBnuAbgxAJTuvMEajgHXts1nzcJWLKyQ1YN2vANCqXCRQ1j5ezaNJKlosB6NrEltIbsKJ5zLXrp8rrr44ml1gyWiaSunfPs4tz54p3MAq32bZ6MljxdXr59ZvTR7NJ0kBtrQEQ7nlN09IVS7mkn/mOnp778olH3nw7t1/ZQs3f5q3bNuynIE4tIbc8MU/iqnFW8GOAztKmU3jht869XdOIYRMZyuFzy/H+jO/Ctl1wN+MdRZTiRU7cPbLth4UNDnF1T1dpczZ75vbM4lgZPaxYGSkN30VI6TgUH4FK9xNevpd2iL307J/jIzRmHySyldvo4HmZ08iWu8lIiTFxBS57ArRg6/ip6/C4VKapy9/Rug+m8gzXYzOX2DcGIYSU1uvPHTta8aN4dDcd3Q81U5wl8PI718wkl2A4eRFQg+4W+LosRhH1xZ5dPo9hAJhw8DMh4ytLdI5Ft3ShfuCDC/N/AMdtzXsl7IlxgAAAABJRU5ErkJggg=='
	},
};  

export const WALLS: {
  horizontal: { active: boolean; id: string }[][];
  vertical:   { active: boolean; id: string }[][];
} = {
  horizontal: Array(GRID_WIDTH + 1)
    .fill(null)
    .map(() => Array(GRID_HEIGHT + 1).fill({ active: false, id: '' })),
  vertical: Array(GRID_WIDTH + 1)
    .fill(null)
    .map(() => Array(GRID_HEIGHT + 1).fill({ active: false, id: '' }))
};

export const setWall = (x: number, y: number, direction: 'horizontal' | 'vertical', lineId: string) => {
	if (direction === 'horizontal') {
		if (x >= 0 && x < WALLS.horizontal.length && y >= 0 && y < WALLS.horizontal[0].length) {
			WALLS.horizontal[x][y] = { active: true, id: lineId };
		}
	} else {
		if (x >= 0 && x < WALLS.vertical.length && y >= 0 && y < WALLS.vertical[0].length) {
			WALLS.vertical[x][y] = { active: true, id: lineId };
		}
	}
};

export const hasWall = (x: number, y: number, direction: 'up' | 'down' | 'left' | 'right'): boolean => {
	switch (direction) {
		case 'up':
			return WALLS.horizontal[x][y].active;
		case 'down':
			return WALLS.horizontal[x + 1][y].active;
		case 'left':
			return WALLS.vertical[x][y].active;
		case 'right':
			return WALLS.vertical[x][y + 1].active;
	}
};
