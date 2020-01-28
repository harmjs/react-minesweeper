import React, { useState } from 'react';

const ImmutableWrapper = function(mutable) {
  this.mutable = mutable;
}

export function useObject(mutable) {
  const [state, setState] = useState(new ImmutableWrapper(mutable));

  const updateObject = function() {
    setState(new ImmutableWrapper(state.mutable));
  }
  
  return [state.mutable, updateObject];
}