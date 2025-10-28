let pwnedResponse = 0

export const pwnedMock = () => {
	return pwnedResponse
}

export const setPwnedMockResponse = (response: number) => {
	pwnedResponse = response
}
